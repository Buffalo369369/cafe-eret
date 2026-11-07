import { test, mock, after } from 'node:test';
import assert from 'node:assert/strict';
const saved=[], emails=[], telegram=[], sessions=[], coupons=[];
let failStorage=false;
let paymentStatus='paid';
let geocoderDistanceKm=2;
const metadata={name:'Test',phone:'123',email:'test@example.test',deliveryType:'pickup',timeType:'asap',coupon:'TEST',subtotalCents:'2000',discountCents:'200',deliveryFeeCents:'0',totalCents:'1800'};
class FakeStripe {
 coupons={create:async p=>{coupons.push(p);return {id:'mock_coupon'};}};
 checkout={sessions:{
  create:async p=>{sessions.push(p); return {id:'cs_test_mock',url:'https://example.test/checkout'};},
  retrieve:async()=>({id:'cs_test_mock',payment_status:paymentStatus,amount_total:1800,currency:'eur',metadata}),
  listLineItems:async()=>({data:[{description:'Spiegeleier mit Gemüse',quantity:2,amount_subtotal:2000,amount_total:1800}]}),
 }};
 webhooks={constructEvent:(body,signature)=>{if(signature!=='valid') throw new Error('invalid signature'); return JSON.parse(body);}};
}
class CouponValidationError extends Error {}
mock.module('stripe',{defaultExport:FakeStripe});
mock.module('../lib/saveOrder.ts',{namedExports:{saveOrder:async o=>{if(failStorage)throw new Error('mock storage failure');saved.push(o);return {order_number:123,id:'order-123'};}}});
mock.module('../lib/coupons.ts',{namedExports:{CouponValidationError,getValidCoupon:async code=>{if(code==='BAD')throw new CouponValidationError('Invalid');return code?{code:'TEST',type:'percent',value:10}:null;},incrementCouponUsage:async()=>{}}});
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
