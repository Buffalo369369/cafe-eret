import { test, mock, after } from 'node:test';
import assert from 'node:assert/strict';
const saved=[], emails=[], telegram=[], sessions=[], coupons=[];
const promo={redeemed:0,customers:new Set(),reservations:new Map(),cashRequests:new Map(),stripeSessions:new Map()};
let failStorage=false;
let paymentStatus='paid';
let geocoderDistanceKm=2;
const metadata={name:'Test',phone:'123',email:'test@example.test',deliveryType:'pickup',timeType:'asap',coupon:'TEST',subtotalCents:'2000',discountCents:'200',deliveryFeeCents:'0',totalCents:'1800'};
class FakeStripe {
 coupons={create:async p=>{coupons.push(p);return {id:'mock_coupon'};}};
 checkout={sessions:{
  create:async p=>{sessions.push(p); return {id:'cs_test_mock',url:'https://example.test/checkout'};},
  expire:async id=>({id,status:'expired'}),
  retrieve:async()=>({id:'cs_test_mock',payment_status:paymentStatus,amount_total:1800,currency:'eur',metadata:sessions.at(-1)?.metadata??metadata}),
  listLineItems:async()=>({data:[{description:'Spiegeleier mit Gemüse',quantity:2,amount_subtotal:2000,amount_total:1800}]}),
 }};
 webhooks={constructEvent:(body,signature)=>{if(signature!=='valid') throw new Error('invalid signature'); return JSON.parse(body);}};
}
class CouponValidationError extends Error {}
class Eret10ValidationError extends Error {}
mock.module('stripe',{defaultExport:FakeStripe});
mock.module('../lib/saveOrder.ts',{namedExports:{saveOrder:async o=>{if(failStorage)throw new Error('mock storage failure');saved.push(o);return {order_number:123,id:'order-123'};}}});
mock.module('../lib/coupons.ts',{namedExports:{CouponValidationError,normalizeCouponCode:code=>typeof code==='string'?code.trim().toUpperCase():'',getValidCoupon:async code=>{if(code==='BAD')throw new CouponValidationError('Invalid');return code?{code:'TEST',type:'percent',value:10}:null;},incrementCouponUsage:async()=>{}}});
mock.module('../lib/eret10.ts',{namedExports:{
 ERET10_CODE:'ERET10',ERET10_COUPON:{code:'ERET10',type:'percent',value:10},Eret10ValidationError,
 requireEret10RequestId:value=>{if(typeof value!=='string')throw new Eret10ValidationError('Invalid request');return value;},
 checkEret10Eligibility:async(email,phone)=>{const key=`${email}|${phone}`;if(promo.redeemed>=30)throw new Eret10ValidationError('Die ERET10-Aktion ist leider nicht mehr verfügbar.');if(promo.customers.has(key))throw new Eret10ValidationError('Nur erste Bestellung');return {code:'ERET10',type:'percent',value:10};},
 reserveEret10:async({email,phone,reservationId})=>{const key=`${email}|${phone}`;if(promo.redeemed+promo.reservations.size>=30)throw new Eret10ValidationError('Die ERET10-Aktion ist leider nicht mehr verfügbar.');if(promo.customers.has(key)||[...promo.reservations.values()].some(r=>r.key===key))throw new Eret10ValidationError('Nur erste Bestellung');promo.reservations.set(reservationId,{key,stripeSessionId:null});return {code:'ERET10',type:'percent',value:10};},
 attachEret10StripeSession:async(reservationId,stripeSessionId)=>{const reservation=promo.reservations.get(reservationId);if(!reservation)throw new Error('Invalid reservation');reservation.stripeSessionId=stripeSessionId;},
 cancelEret10Reservation:async id=>{promo.reservations.delete(id);},
 cancelEret10StripeReservation:async stripeSessionId=>{for(const [id,reservation] of promo.reservations){if(reservation.stripeSessionId===stripeSessionId)promo.reservations.delete(id);}},
 acceptEret10CashOrder:async({email,phone,requestId,order})=>{if(promo.cashRequests.has(requestId))return {created:false,order:promo.cashRequests.get(requestId)};const key=`${email}|${phone}`;if(promo.redeemed+promo.reservations.size>=30)throw new Eret10ValidationError('Die ERET10-Aktion ist leider nicht mehr verfügbar.');if(promo.customers.has(key))throw new Eret10ValidationError('Nur erste Bestellung');const result={...order,order_number:1000+promo.redeemed};promo.redeemed++;promo.customers.add(key);promo.cashRequests.set(requestId,result);return {created:true,order:result};},
 acceptEret10StripeOrder:async({reservationId,stripeSessionId,order})=>{if(promo.stripeSessions.has(stripeSessionId))return {created:false,order:promo.stripeSessions.get(stripeSessionId)};const reservation=promo.reservations.get(reservationId);if(!reservation||reservation.stripeSessionId!==stripeSessionId)throw new Error('Invalid reservation');const result={...order,order_number:2000+promo.redeemed};promo.reservations.delete(reservationId);promo.redeemed++;promo.customers.add(reservation.key);promo.stripeSessions.set(stripeSessionId,result);return {created:true,order:result};},
}});
mock.module('../lib/sendOrderEmail.ts',{namedExports:{sendOrderEmail:async p=>emails.push(p)}});
mock.module('../lib/sendOrderTelegram.ts',{namedExports:{sendOrderTelegram:async p=>telegram.push(p)}});
// Permit only deterministic geocoding; fail closed for every other network operation.
globalThis.fetch=async url=>{
 if(String(url).startsWith('https://nominatim.openstreetmap.org/search?')) {
  return {json:async()=>[{lat:String(51.4308 + geocoderDistanceKm / 111.195),lon:'6.8797'}]};
 }
 throw new Error('Network forbidden in isolated tests');
};
mock.timers.enable({apis:['Date'],now:new Date('2026-11-03T11:00:00Z')});
after(()=>mock.timers.reset());
const cash=await import('../app/api/order/route.ts');
const card=await import('../app/api/checkout/route.ts');
const webhook=await import('../app/api/webhook/route.ts');
const verify=await import('../app/api/verify/route.ts');
const delivery=await import('../app/api/delivery/route.ts');
const couponRoute=await import('../app/api/coupon/route.ts');
const base={items:[{id:'fr-1',name:'Fake client title',price:10,qty:2}],form:{name:'Test',phone:'123',email:'test@example.test'},payment:'cash',deliveryType:'pickup',timeType:'asap',selectedTime:'',coupon:'TEST'};
const request=(data)=>new Request('http://localhost/api/order',{method:'POST',body:JSON.stringify(data)});
test('cash saves canonical items and coupon total, invokes mocked notifications',async()=>{
 const response=await cash.POST(request(base)); assert.equal(response.status,200);
 const confirmation=await response.json();
 assert.deepEqual(confirmation,{success:true,orderNumber:123,totalCents:1800,currency:'EUR'});
 assert.equal(saved.at(-1).total,18); assert.equal(saved.at(-1).items[0].name,'Spiegeleier mit Gemüse');
 assert.equal(emails.at(-1).discount,2); assert.equal(telegram.at(-1).pricing.total,18);
});
test('Stripe line items and coupon match cash total',async()=>{
 const response=await card.POST(request(base)); assert.equal(response.status,200);
 const p=sessions.at(-1);
 assert.equal(p.line_items[0].price_data.unit_amount,1000);
 assert.equal(p.line_items[0].quantity,2); assert.equal(coupons.at(-1).amount_off,200);
 assert.equal(p.metadata.totalCents,'1800');
});
test('both routes enforce delivery minimum and calculate the server fee',async()=>{
 const deliveryBase={...base,form:{...base.form,address:'Teststraße 1, 45468 Mülheim'},deliveryType:'delivery',deliveryFee:0};
 for(const [distance,fee] of [[2,290],[4,390]]) {
  geocoderDistanceKm=distance;
  const cashResponse=await cash.POST(request(deliveryBase));
  assert.equal(cashResponse.status,200);
  assert.equal((await cashResponse.json()).totalCents,1800+fee);
  assert.equal(saved.at(-1).items.find(item=>item.name==='🚚 Lieferung').price*100,fee);
  assert.equal((await card.POST(request(deliveryBase))).status,200);
  assert.equal(sessions.at(-1).line_items.find(item=>item.price_data.product_data.name==='🚚 Lieferung').price_data.unit_amount,fee);
 }
 const belowMinimum={...deliveryBase,items:[{id:'fr-1',name:'ignored',price:10,qty:1}]};
 for(const handler of [cash.POST,card.POST]) assert.equal((await handler(request(belowMinimum))).status,400);
});
test('both routes reject forged price, delivery, invalid customer and invalid timing',async()=>{
 const count=saved.length, sessionCount=sessions.length;
 for(const handler of [cash.POST,card.POST]) {
  for(const patch of [{items:[{...base.items[0],price:0.01}]},{deliveryType:'delivery',deliveryFee:0},{form:{...base.form,email:'bad'}},{timeType:'today',selectedTime:'09:00'},{scheduleDate:'2026-11-04'},{coupon:'BAD'}]) assert.equal((await handler(request({...base,...patch}))).status,400);
 }
 assert.equal(saved.length,count);assert.equal(sessions.length,sessionCount);
});
test('both endpoints reject Monday, preopening and 17:30 cutoff before side effects',async()=>{
 const counts=[saved.length,sessions.length,emails.length,telegram.length,coupons.length];
 for(const date of ['2026-11-02T11:00:00Z',...['03','04','05','06','07','08'].map(day=>`2026-11-${day}T08:59:00Z`),'2026-11-03T16:30:00Z','2026-11-03T16:31:00Z']) {
  mock.timers.setTime(new Date(date).getTime());
  for(const handler of [cash.POST,card.POST]) assert.equal((await handler(request(base))).status,403);
 }
 assert.deepEqual([saved.length,sessions.length,emails.length,telegram.length,coupons.length],counts);
 mock.timers.setTime(new Date('2026-11-03T11:00:00Z').getTime());
});
test('cash and Stripe accept 10:00 opening and same-day slots, preserving closing boundary',async()=>{
 try {
  for (const day of ['03','04','05','06','07','08']) {
   mock.timers.setTime(new Date(`2026-11-${day}T09:00:00Z`).getTime());
   for (const handler of [cash.POST,card.POST]) {
    assert.equal((await handler(request(base))).status,200);
    assert.equal((await handler(request({...base,timeType:'today',selectedTime:'10:15'}))).status,200);
    assert.equal((await handler(request({...base,timeType:'today',selectedTime:'09:45'}))).status,400);
    assert.equal((await handler(request({...base,scheduleDate:'2026-11-09'}))).status,400);
   }
  }
  mock.timers.setTime(new Date('2026-11-03T16:29:00Z').getTime());
  for (const handler of [cash.POST,card.POST]) {
   assert.equal((await handler(request(base))).status,200);
   assert.equal((await handler(request({...base,timeType:'today',selectedTime:'17:30'}))).status,200);
   assert.equal((await handler(request({...base,timeType:'today',selectedTime:'17:45'}))).status,400);
  }
 } finally { mock.timers.setTime(new Date('2026-11-03T11:00:00Z').getTime()); }
});
test('cash storage failure does not claim success or notify',async()=>{
 const count=emails.length;failStorage=true;
 assert.equal((await cash.POST(request(base))).status,500);failStorage=false;
 assert.equal(emails.length,count);
});
const event={type:'checkout.session.completed',id:'evt_test_mock',data:{object:{id:'cs_test_mock'}}};
const webhookRequest=(signature='valid',data=event)=>new Request('http://localhost/api/webhook',{method:'POST',headers:{'stripe-signature':signature},body:JSON.stringify(data)});
test('webhook rejects invalid signatures and ignores unrelated/unpaid sessions',async()=>{
 const count=saved.length;
 assert.equal((await webhook.POST(webhookRequest('bad'))).status,400);
 await webhook.POST(webhookRequest('valid',{type:'other'}));
 paymentStatus='unpaid';await webhook.POST(webhookRequest());paymentStatus='paid';
 assert.equal(saved.length,count);
});
test('paid webhook stores prediscount item values and one discount only',async()=>{
 assert.equal((await webhook.POST(webhookRequest())).status,200);
 const order=saved.at(-1);assert.equal(order.total,18);
 assert.equal(order.items.reduce((sum,i)=>sum+i.price*i.qty,0),18);
 assert.equal(order.items[0].price,10);assert.equal(telegram.at(-1).items[0].price,10);
});
test('Stripe verification exposes conversion data only for an authoritative paid session',async()=>{
 paymentStatus='unpaid';
 let response=await verify.GET(new Request('http://localhost/api/verify?session_id=cs_test_mock'));
 assert.deepEqual(await response.json(),{paid:false});
 paymentStatus='paid';
 response=await verify.GET(new Request('http://localhost/api/verify?session_id=cs_test_mock'));
 assert.deepEqual(await response.json(),{
  paid:true,
  transactionId:'stripe:cs_test_mock',
  totalCents:1800,
  currency:'EUR',
 });
});
test('delivery endpoint rejects without geocoder calls',async()=>{
 const response=await delivery.POST(new Request('http://localhost/api/delivery',{method:'POST',body:JSON.stringify({address:''})}));
 assert.equal(response.status,400);
});

function resetPromo(){promo.redeemed=0;promo.customers.clear();promo.reservations.clear();promo.cashRequests.clear();promo.stripeSessions.clear();}
const uuid=index=>`00000000-0000-4000-8000-${String(index).padStart(12,'0')}`;
const eretOrder=(index,requestId=uuid(index))=>({...base,coupon:'ERET10',promotionRequestId:requestId,form:{...base.form,email:`promo${index}@example.test`,phone:`0208${String(index).padStart(6,'0')}`}});

test('ERET10 cash orders apply 10% to items, accept only 30 concurrent customers and reject the 31st',async()=>{
 resetPromo();
 const responses=await Promise.all(Array.from({length:30},(_,index)=>cash.POST(request(eretOrder(index+1)))));
 assert.equal(responses.filter(response=>response.status===200).length,30);
 assert.equal(promo.redeemed,30);
 for(const response of responses) assert.equal((await response.json()).totalCents,1800);
 const rejected=await cash.POST(request(eretOrder(31)));
 assert.equal(rejected.status,400);
 assert.match((await rejected.json()).error,/nicht mehr verfügbar/);
});

test('ERET10 cash duplicate requests count once and an existing customer cannot redeem again',async()=>{
 resetPromo();
 const payload=eretOrder(1);
 const notificationsBefore=emails.length;
 assert.equal((await cash.POST(request(payload))).status,200);
 assert.equal((await cash.POST(request(payload))).status,200);
 assert.equal(promo.redeemed,1);
 assert.equal(emails.length,notificationsBefore+1);
 const repeatedCustomer={...payload,promotionRequestId:uuid(2)};
 assert.equal((await cash.POST(request(repeatedCustomer))).status,400);
 assert.equal(promo.redeemed,1);
});

test('ERET10 Stripe reserves without counting, then counts one paid webhook idempotently',async()=>{
 resetPromo();
 const payload={...eretOrder(1),payment:'card'};
 const checkout=await card.POST(request(payload));
 assert.equal(checkout.status,200);
 assert.equal(promo.redeemed,0);
 assert.equal(promo.reservations.size,1);
 assert.equal(coupons.at(-1).amount_off,200);
 assert.equal(sessions.at(-1).metadata.coupon,'ERET10');
 const notificationsBefore=emails.length;
 mock.timers.setTime(new Date('2026-11-04T11:00:00Z').getTime());
 assert.equal((await webhook.POST(webhookRequest())).status,200);
 assert.equal((await webhook.POST(webhookRequest())).status,200);
 mock.timers.setTime(new Date('2026-11-03T11:00:00Z').getTime());
 assert.equal(promo.redeemed,1);
 assert.equal(emails.length,notificationsBefore+1);
});

test('ERET10 expired Stripe checkout releases its reservation without counting',async()=>{
 resetPromo();
 const payload={...eretOrder(1),payment:'card'};
 assert.equal((await card.POST(request(payload))).status,200);
 assert.equal(promo.reservations.size,1);
 const expired={type:'checkout.session.expired',data:{object:{id:'cs_test_mock'}}};
 assert.equal((await webhook.POST(webhookRequest('valid',expired))).status,200);
 assert.equal(promo.reservations.size,0);
 assert.equal(promo.redeemed,0);
});

test('ERET10 coupon check returns a clear German message after 30 redemptions',async()=>{
 resetPromo();promo.redeemed=30;
 const response=await couponRoute.POST(new Request('http://localhost/api/coupon',{method:'POST',body:JSON.stringify({code:'eret10',email:'new@example.test',phone:'0208123456'})}));
 assert.deepEqual(await response.json(),{valid:false,message:'Die ERET10-Aktion ist leider nicht mehr verfügbar.'});
});
