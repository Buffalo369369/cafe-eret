import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
 CONSENT_STORAGE_KEY,
 GOOGLE_ADS_SEND_TO,
 GOOGLE_CONSENT_DENIED,
 conversionMarkerKey,
 createPurchaseDispatcher,
 getGoogleAdsConfig,
 parseConsentChoice,
 parsePurchaseConversion,
 readConsentChoice,
 sanitizePageLocation,
} from '../lib/google-ads.ts';

function memoryStorage(initial={},fail=false) {
 const values=new Map(Object.entries(initial));
 return {
  getItem:key=>{if(fail)throw new Error('storage blocked');return values.has(key)?values.get(key):null;},
  setItem:(key,value)=>{if(fail)throw new Error('storage blocked');values.set(key,String(value));},
  removeItem:key=>{if(fail)throw new Error('storage blocked');values.delete(key);},
 };
}

function fakeClock() {
 let time=0,id=0;
 const timers=new Map();
 const setTimer=(callback,delay)=>{const handle=++id;timers.set(handle,{at:time+delay,callback});return handle;};
 const clearTimer=handle=>timers.delete(handle);
 const advance=milliseconds=>{
  const target=time+milliseconds;
  while(true){
   const due=[...timers.entries()].filter(([,timer])=>timer.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];
   if(!due)break;
   timers.delete(due[0]);time=due[1].at;due[1].callback();
  }
  time=target;
 };
 return {now:()=>time,setTimer,clearTimer,advance};
}

function dispatcherHarness({throwCalls=false,storage=memoryStorage()}={}) {
 const clock=fakeClock(),calls=[];
 const dispatcher=createPurchaseDispatcher({
  storage,
  gtag:(...args)=>{calls.push(args);if(throwCalls)throw new Error('gtag failed');},
  getPageLocation:()=> 'https://cafe-eret.de/success?session_id=cs_secret&email=test@example.test#done',
  now:clock.now,
  setTimer:clock.setTimer,
  clearTimer:clock.clearTimer,
 });
 return {clock,calls,dispatcher,storage};
}

const purchase={transactionId:'cash:123',value:20.9,currency:'EUR'};

test('consent requires an explicit versioned advertising choice',()=>{
 assert.deepEqual(GOOGLE_CONSENT_DENIED,{
  ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',
 });
 assert.equal(parseConsentChoice(null),null);
 assert.equal(readConsentChoice(memoryStorage({'cookie-consent':'accepted'})),null);
 assert.deepEqual(readConsentChoice(memoryStorage({'cookie-consent':'rejected'})),{version:2,advertising:false});
 const stored=JSON.stringify({version:2,advertising:true});
 assert.deepEqual(readConsentChoice(memoryStorage({[CONSENT_STORAGE_KEY]:stored})),{version:2,advertising:true});
});

test('purchase parsing and page metadata exclude malformed values and sensitive query data',()=>{
 assert.equal(parsePurchaseConversion(null),null);
 assert.equal(parsePurchaseConversion(JSON.stringify({transactionId:'cash:123',value:18,currency:'USD'})),null);
 assert.equal(parsePurchaseConversion(JSON.stringify({transactionId:'customer@example.test',value:18,currency:'EUR'})),null);
 assert.deepEqual(
  parsePurchaseConversion(JSON.stringify({transactionId:'stripe:cs_test_123',value:18,currency:'EUR'})),
  {transactionId:'stripe:cs_test_123',value:18,currency:'EUR'}
 );
 assert.equal(
  sanitizePageLocation('https://cafe-eret.de/success?session_id=cs_secret&email=test@example.test#done'),
  'https://cafe-eret.de/success'
 );
 assert.deepEqual(
  getGoogleAdsConfig('https://cafe-eret.de/success?session_id=cs_secret'),
  {
   allow_ad_personalization_signals:false,
   send_page_view:false,
   page_location:'https://cafe-eret.de/success',
   page_referrer:'',
  }
 );
});

test('dispatcher requires consent, waits for callback and suppresses confirmed duplicates',()=>{
 const {calls,dispatcher,storage}=dispatcherHarness();
 assert.equal(dispatcher.dispatch(purchase),false);
 dispatcher.setAdvertisingConsent(true);
 assert.equal(dispatcher.dispatch(purchase),true);
 assert.equal(dispatcher.dispatch(purchase),false);
 assert.equal(storage.getItem(conversionMarkerKey('cash:123')),null);
 assert.equal(calls.length,1);
 assert.deepEqual(calls[0].slice(0,2),['event','conversion']);
 assert.deepEqual({...calls[0][2],event_callback:undefined},{
  send_to:GOOGLE_ADS_SEND_TO,value:20.9,currency:'EUR',transaction_id:'cash:123',
  page_location:'https://cafe-eret.de/success',page_referrer:'',event_callback:undefined,event_timeout:5000,
 });
 calls[0][2].event_callback();
 assert.equal(storage.getItem(conversionMarkerKey('cash:123')),'sent');
 assert.equal(dispatcher.dispatch(purchase),false);
 const reloaded=dispatcherHarness({storage});
 reloaded.dispatcher.setAdvertisingConsent(true);
 assert.equal(reloaded.dispatcher.dispatch(purchase),false);
 assert.equal(reloaded.calls.length,0);
});

test('a page reload during an unconfirmed attempt resumes one controlled retry',()=>{
 const storage=memoryStorage();
 const first=dispatcherHarness({storage});
 first.dispatcher.setAdvertisingConsent(true);
 assert.equal(first.dispatcher.dispatch(purchase),true);
 const reloaded=dispatcherHarness({storage});
 reloaded.dispatcher.setAdvertisingConsent(true);
 assert.equal(reloaded.dispatcher.dispatch(purchase),false);
 reloaded.clock.advance(3000);
 assert.equal(reloaded.calls.length,1);
});

test('timeouts retry once, then cool down until a later explicit attempt',()=>{
 const {calls,clock,dispatcher}=dispatcherHarness();
 dispatcher.setAdvertisingConsent(true);
 assert.equal(dispatcher.dispatch(purchase),true);
 clock.advance(3999);assert.equal(calls.length,1);
 clock.advance(1);assert.equal(calls.length,2);
 clock.advance(3000);assert.equal(calls.length,2);
 assert.equal(dispatcher.dispatch(purchase),false);
 clock.advance(300000);
 assert.equal(dispatcher.dispatch(purchase),true);
 assert.equal(calls.length,3);
});

test('thrown calls and blocked storage do not mark sent or retry endlessly',()=>{
 const {calls,clock,dispatcher}=dispatcherHarness({throwCalls:true,storage:memoryStorage({},true)});
 dispatcher.setAdvertisingConsent(true);
 assert.equal(dispatcher.dispatch(purchase),false);
 clock.advance(1000);
 assert.equal(calls.length,2);
 clock.advance(600000);
 assert.equal(calls.length,2);
});

test('withdrawal cancels pending work and ignores delayed callbacks during rapid changes',()=>{
 const {calls,clock,dispatcher,storage}=dispatcherHarness();
 dispatcher.setAdvertisingConsent(true);
 dispatcher.dispatch(purchase);
 const delayedCallback=calls[0][2].event_callback;
 dispatcher.setAdvertisingConsent(false);
 delayedCallback();
 assert.equal(storage.getItem(conversionMarkerKey('cash:123')),null);
 clock.advance(10000);assert.equal(calls.length,1);
 dispatcher.setAdvertisingConsent(true);
 assert.equal(dispatcher.dispatch(purchase),true);
 assert.equal(calls.length,2);
 dispatcher.setAdvertisingConsent(false);
 dispatcher.setAdvertisingConsent(true);
 calls[1][2].event_callback();
 assert.equal(storage.getItem(conversionMarkerKey('cash:123')),null);
});
