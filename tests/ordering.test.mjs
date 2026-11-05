import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderPricing, buildOrderItems } from '../lib/order-pricing.ts';
import { getOrderingAvailability, getAvailableTodayTimeSlots, validateOrderTiming } from '../lib/ordering-availability.ts';
import { resolveOrderItems, validateCustomer, validateFulfilment } from '../lib/order-validation.ts';
import { existingDeliveryQuote } from '../lib/delivery-policy.ts';
import { isAdminAuthorized } from '../lib/admin-auth.ts';
import { menuData } from '../store/menu.ts';

const item = {id:'fr-1',name:'Spiegeleier mit Gemüse',price:10,qty:2};
test('pricing uses cents and discounts items, never delivery; fixed discounts capped',()=>{
 assert.equal(calculateOrderPricing({items:[item],deliveryFee:2.9,coupon:{code:'TEST',type:'percent',value:10}}).totalCents,2090);
 assert.equal(calculateOrderPricing({items:[item],deliveryFee:2.9,coupon:{code:'TEST',type:'fixed',value:30}}).totalCents,290);
 const pricing=calculateOrderPricing({items:[{...item,price:11.7,qty:3}],coupon:{code:'TEST',type:'percent',value:15}});
 assert.equal(pricing.totalCents,2983);
 assert.equal(buildOrderItems({items:[item],deliveryFee:2.9,coupon:{code:'TEST',type:'fixed',value:3},discount:3}).reduce((s,i)=>s+i.price*i.qty,0),19.9);
});
test('catalog supports every current product, default menu ID, milk and extras',()=>{
 for(const p of menuData.flatMap(s=>s.items)) {
  assert.equal(resolveOrderItems([{id:p.id,name:p.name,price:p.price,qty:1}])[0].price,p.price);
  for(const milk of p.options?.[0]?.values ?? [{id:'normal',price:0}]) {
   const extras=p.extras;
   const price=p.price+milk.price+extras.reduce((s,e)=>s+e.price,0);
   assert.equal(resolveOrderItems([{id:`${p.id}-${milk.id}-${extras.map(e=>e.id).join('-')}`,name:'untrusted',price,qty:1}])[0].price,price);
  }
 }
});
test('reject price tampering, fake products, unknown/duplicate extras and invalid quantity',()=>{
 for(const change of [{price:0.01},{id:'fake'},{qty:-1},{qty:1.5},{id:'fr-1-normal-lachs-lachs',price:16},{id:'fr-1-normal-fake'}]) assert.throws(()=>resolveOrderItems([{...item,...change}]));
 assert.equal(resolveOrderItems([{...item,name:'<b>fake</b>'}])[0].name,item.name);
});
test('pickup, delivery and valid customer details are enforced',()=>{
 assert.doesNotThrow(()=>validateFulfilment('pickup'));
 assert.doesNotThrow(()=>validateFulfilment('delivery'));
 for(const v of ['','undefined',null,'other']) assert.throws(()=>validateFulfilment(v));
 assert.throws(()=>validateCustomer({name:'a',phone:'1',email:'bad'}));
 assert.equal(validateCustomer({name:' A ',phone:'1',email:'a@example.test',address:'ignored'}).address,'');
});
test('Berlin hours, Monday, weekend, cutoff and DST',()=>{
 const available=(iso)=>getOrderingAvailability(new Date(iso)).isAvailable;
 assert.equal(available('2026-11-02T11:00:00Z'),false);
 for (const day of ['03','04','05','06','07','08']) {
  assert.equal(available(`2026-11-${day}T08:59:00Z`),false);
  assert.equal(available(`2026-11-${day}T09:00:00Z`),true);
 }
 for (const hour of ['00','09','12','17','23']) {
  assert.equal(available(`2026-11-02T${hour}:00:00+01:00`),false);
 }
 // Summer time and both DST transition Sundays still open at 10:00 Berlin time.
 for (const [date, offset] of [['2026-07-07','+02:00'],['2026-03-29','+02:00'],['2026-10-25','+01:00']]) {
  assert.equal(available(`${date}T09:59:00${offset}`),false);
  assert.equal(available(`${date}T10:00:00${offset}`),true);
 }
 assert.equal(available('2026-11-07T08:59:00Z'),false);
 assert.equal(available('2026-11-07T09:00:00Z'),true);
 assert.equal(available('2026-11-03T16:29:59Z'),true);
 assert.equal(available('2026-11-03T16:30:00Z'),false);
 assert.equal(available('2026-11-03T16:31:00Z'),false);
 assert.equal(available('2026-07-07T15:30:00Z'),false);
 assert.equal(available('2026-11-03T17:00:00Z'),false);
});
test('same-day future quarter-hour slots only, last slot 17:30',()=>{
 const beforeOpening = new Date('2026-11-03T08:59:00Z');
 assert.equal(getAvailableTodayTimeSlots(beforeOpening)[0],'10:00');
 const opening = new Date('2026-11-03T09:00:00Z');
 assert.equal(getAvailableTodayTimeSlots(opening)[0],'10:15');
 assert.equal(validateOrderTiming({timeType:'today',selectedTime:'10:15',now:opening}),null);
 assert.ok(validateOrderTiming({timeType:'today',selectedTime:'09:45',now:opening}));
 assert.equal(validateOrderTiming({timeType:'asap',selectedTime:'',now:opening}),null);
 assert.deepEqual(getAvailableTodayTimeSlots(new Date('2026-11-02T09:00:00Z')),[]);
 const now=new Date('2026-11-03T16:14:00Z');
 assert.deepEqual(getAvailableTodayTimeSlots(now),['17:15','17:30']);
 const request={timeType:'today',selectedTime:'17:30',requestedDate:undefined,now};
 assert.equal(validateOrderTiming(request),null);
 assert.ok(validateOrderTiming({...request,selectedTime:'17:14'}));
 assert.ok(validateOrderTiming({...request,requestedDate:'2026-11-04'}));
 assert.deepEqual(getAvailableTodayTimeSlots(new Date('2026-11-03T16:30:00Z')),[]);
});
test('delivery quote boundary values use the approved fee bands',()=>{
 assert.deepEqual(existingDeliveryQuote(3),{available:true,fee:2.9});
 assert.deepEqual(existingDeliveryQuote(3.01),{available:true,fee:3.9});
 assert.deepEqual(existingDeliveryQuote(5),{available:true,fee:3.9});
 assert.equal(existingDeliveryQuote(5.01).available,false);
 assert.equal(existingDeliveryQuote(NaN).available,false);
});
test('cart add, increase, decrease, remove, totals and clear',async()=>{
 const storage=new Map();
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const {useCart}=await import('../store/cart.ts');
 useCart.getState().clearCart();
 useCart.getState().addItem(item); useCart.getState().addItem(item);
 assert.equal(useCart.getState().count(),2); assert.equal(useCart.getState().total(),20);
 useCart.getState().increaseQty(item.id); assert.equal(useCart.getState().total(),30);
 useCart.getState().decreaseQty(item.id); useCart.getState().removeItem(item.id);
 assert.equal(useCart.getState().count(),0);
 useCart.getState().addItem(item); useCart.getState().decreaseQty(item.id);
 assert.equal(useCart.getState().items.length,0);
});
test('admin auth fails closed and handles malformed credentials',()=>{
 process.env.ADMIN_USER='test'; process.env.ADMIN_PASSWORD='test:password';
 assert.equal(isAdminAuthorized('Basic '+btoa('test:test:password')),true);
 assert.equal(isAdminAuthorized('Basic %%%%'),false);
 assert.equal(isAdminAuthorized(null),false);
 delete process.env.ADMIN_PASSWORD;
 assert.equal(isAdminAuthorized('Basic '+btoa('test:')),false);
});
test('delivery quote boundary values and rejected invalid addresses', async () => {
 const validAddress = 'Kaiserstraße 12, 45127 Essen, Germany';
 assert.deepEqual(existingDeliveryQuote(3), { available: true, fee: 2.9 });
 assert.deepEqual(existingDeliveryQuote(3.01), { available: true, fee: 3.9 });
 assert.deepEqual(existingDeliveryQuote(5), { available: true, fee: 3.9 });
 assert.equal(existingDeliveryQuote(5.01).available, false);
 assert.equal(existingDeliveryQuote(NaN).available, false);
 const { POST } = await import('../app/api/delivery/route.ts');
 assert.equal((await POST(new Request('http://localhost/api/delivery', { method: 'POST', body: JSON.stringify({ address: '' }) }))).status, 400);
 const geocoder = mock.method(globalThis, 'fetch', async () => ({ json: async () => [] }));
 try {
  const response = await POST(new Request('http://localhost/api/delivery', { method: 'POST', body: JSON.stringify({ address: validAddress }) }));
  assert.equal(response.status,200);
  assert.equal((await response.json()).available,false);
 } finally { geocoder.mock.restore(); }
});

const deliveryItem = { id: 'fr-1', name: 'Spiegeleier mit Gemüse', price: 10, qty: 2 };

test('delivery pricing includes the approved fee values', async () => {
 const subtotal = deliveryItem.price * deliveryItem.qty;
 assert.equal(subtotal >= 15, true);
 assert.equal(calculateOrderPricing({ items: [deliveryItem], deliveryFee: 2.9 }).totalCents, 2290);
 assert.equal(calculateOrderPricing({ items: [{ ...deliveryItem, price: 12, qty: 2 }], deliveryFee: 3.9 }).totalCents, 2790);
});
