import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl=new URL('../supabase/migrations/20261112_eret10_first_order_promotion.sql',import.meta.url);
const sql=await readFile(migrationUrl,'utf8');

test('ERET10 migration defines the approved promotion without resetting prior usage',()=>{
 assert.match(sql,/type = 'percent', value = 10/);
 assert.match(sql,/usage_limit = 30/);
 assert.doesNotMatch(sql,/set[^;]*used_count\s*=\s*0/i);
 assert.match(sql,/if not found then\s+insert into public\.coupons/i);
});

test('ERET10 migration serializes capacity and makes cash and Stripe acceptance idempotent',()=>{
 const couponLocks=(sql.match(/from public\.coupons where code = 'ERET10' for update/g)??[]).length;
 assert.ok(couponLocks>=3);
 assert.match(sql,/cash_request_id uuid unique/);
 assert.match(sql,/stripe_session_id text unique/);
 assert.match(sql,/where cash_request_id = p_request_id and status = 'redeemed'/);
 assert.match(sql,/where stripe_session_id = p_stripe_session_id and status = 'redeemed'/);
 assert.match(sql,/if v_redeemed >= 30 then raise exception 'ERET10_SOLD_OUT'/);
});

test('ERET10 migration enforces one active redemption per normalized email and phone',()=>{
 assert.match(sql,/promotion_redemptions_active_email/);
 assert.match(sql,/promotion_redemptions_active_phone/);
 assert.match(sql,/lower\(btrim\(value\)\)/);
 assert.match(sql,/regexp_replace\(value, '\[\^0-9\]'/);
 assert.match(sql,/from public\.orders/);
 assert.match(sql,/create trigger orders_lock_customer_identity/);
 assert.match(sql,/create table if not exists public\.order_customer_locks/);
 assert.match(sql,/perform public\.eret_lock_customer_identity\(p_email, p_phone\)/);
});

test('ERET10 migration keeps attached Stripe reservations until an authoritative outcome',()=>{
 assert.match(sql,/create or replace function public\.attach_eret10_stripe_session/);
 assert.match(sql,/create or replace function public\.cancel_eret10_stripe_reservation/);
 assert.match(sql,/stripe_session_id is null and expires_at <= now\(\)/);
 assert.match(sql,/id = p_reservation_id and stripe_session_id = p_stripe_session_id/);
 assert.doesNotMatch(sql,/id = p_reservation_id and status = 'reserved' and expires_at > now\(\)/);
});

test('ERET10 migration revokes promotion functions from browser roles',()=>{
 assert.match(sql,/revoke all on function public\.eret10_check_eligibility\(text, text\) from public, anon, authenticated;/i);
 assert.match(sql,/revoke all on function public\.accept_eret10_cash_order\(text, text, uuid, jsonb\) from public, anon, authenticated;/i);
 assert.match(sql,/revoke all on function public\.accept_eret10_stripe_order\(uuid, text, jsonb\) from public, anon, authenticated;/i);
 assert.match(sql,/revoke all on function public\.eret_insert_order\(jsonb\) from public, anon, authenticated;/i);
});
