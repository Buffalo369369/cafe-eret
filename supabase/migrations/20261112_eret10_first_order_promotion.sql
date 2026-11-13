-- ERET10: 10% off food/drink subtotal, maximum 30 successful first-order redemptions.
-- Prepared for review only. Do not run against production without a separate approval and backup.

create extension if not exists pgcrypto;

do $$
begin
  update public.coupons
  set type = 'percent', value = 10, active = true, usage_limit = 30
  where upper(btrim(code)) = 'ERET10';

  if not found then
    insert into public.coupons (code, type, value, active, used_count, usage_limit)
    values ('ERET10', 'percent', 10, true, 0, 30);
  end if;
end $$;

create table if not exists public.promotion_redemptions (
  id uuid primary key default gen_random_uuid(),
  promotion_code text not null check (promotion_code = 'ERET10'),
  customer_email_key text not null,
  customer_phone_key text not null,
  status text not null check (status in ('reserved', 'redeemed', 'cancelled', 'expired')),
  cash_request_id uuid unique,
  stripe_session_id text unique,
  order_snapshot jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  redeemed_at timestamptz
);

alter table public.promotion_redemptions enable row level security;

create table if not exists public.order_customer_locks (
  identity_key text primary key
);

alter table public.order_customer_locks enable row level security;

create unique index if not exists promotion_redemptions_active_email
  on public.promotion_redemptions (promotion_code, customer_email_key)
  where status in ('reserved', 'redeemed');

create unique index if not exists promotion_redemptions_active_phone
  on public.promotion_redemptions (promotion_code, customer_phone_key)
  where status in ('reserved', 'redeemed');

create or replace function public.eret_customer_email_key(value text)
returns text language sql immutable strict
set search_path = public
as $$ select lower(btrim(value)) $$;

create or replace function public.eret_customer_phone_key(value text)
returns text language plpgsql immutable strict
set search_path = public
as $$
declare digits text := regexp_replace(value, '[^0-9]', '', 'g');
begin
  if digits like '0049%' then digits := '0' || substr(digits, 5); end if;
  if digits like '49%' and length(digits) > 10 then digits := '0' || substr(digits, 3); end if;
  return digits;
end $$;

-- Serialize new online orders for the same normalized identity. ERET10 uses
-- the same locks before checking order history, closing the race with a
-- simultaneous non-promotional order without changing normal order data.
create or replace function public.eret_lock_order_customer()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  v_email text := public.eret_customer_email_key(new.email);
  v_phone text := public.eret_customer_phone_key(new.phone);
begin
  insert into public.order_customer_locks(identity_key)
  select key from unnest(array[
    case when v_email <> '' then 'email:' || v_email end,
    case when v_phone <> '' then 'phone:' || v_phone end
  ]) key where key is not null
  on conflict do nothing;
  perform 1 from public.order_customer_locks
  where identity_key in ('email:' || v_email, 'phone:' || v_phone)
  order by identity_key for update;
  return new;
end $$;

create or replace function public.eret_lock_customer_identity(p_email text, p_phone text)
returns void language plpgsql security definer
set search_path = public
as $$
declare
  v_email text := public.eret_customer_email_key(p_email);
  v_phone text := public.eret_customer_phone_key(p_phone);
begin
  insert into public.order_customer_locks(identity_key)
  select key from unnest(array['email:' || v_email, 'phone:' || v_phone]) key
  where key <> '' on conflict do nothing;
  perform 1 from public.order_customer_locks
  where identity_key in ('email:' || v_email, 'phone:' || v_phone)
  order by identity_key for update;
end $$;

drop trigger if exists orders_lock_customer_identity on public.orders;
create trigger orders_lock_customer_identity
before insert on public.orders
for each row execute function public.eret_lock_order_customer();

create or replace function public.eret10_check_eligibility(p_email text, p_phone text)
returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  v_email text := public.eret_customer_email_key(p_email);
  v_phone text := public.eret_customer_phone_key(p_phone);
  v_active boolean;
  v_redeemed integer;
  v_reserved integer;
begin
  select active, coalesce(used_count, 0) into v_active, v_redeemed
  from public.coupons where code = 'ERET10';
  if not found then return jsonb_build_object('eligible', false, 'reason', 'not_configured'); end if;
  if not v_active then return jsonb_build_object('eligible', false, 'reason', 'inactive'); end if;
  select count(*) into v_reserved from public.promotion_redemptions
  where promotion_code = 'ERET10' and status = 'reserved'
    and (stripe_session_id is not null or expires_at > now());

  if v_redeemed >= 30 then return jsonb_build_object('eligible', false, 'reason', 'sold_out'); end if;
  if v_redeemed + v_reserved >= 30 then return jsonb_build_object('eligible', false, 'reason', 'temporarily_reserved'); end if;

  if exists (
    select 1 from public.orders
    where public.eret_customer_email_key(email) = v_email
       or public.eret_customer_phone_key(phone) = v_phone
  ) then
    return jsonb_build_object('eligible', false, 'reason', 'not_first_order');
  end if;

  if exists (
    select 1 from public.promotion_redemptions
    where promotion_code = 'ERET10' and status in ('reserved', 'redeemed')
      and (customer_email_key = v_email or customer_phone_key = v_phone)
      and (status = 'redeemed' or stripe_session_id is not null or expires_at > now())
  ) then
    return jsonb_build_object('eligible', false, 'reason', 'already_reserved');
  end if;

  return jsonb_build_object('eligible', true);
end $$;

create or replace function public.reserve_eret10(
  p_email text, p_phone text, p_reservation_id uuid, p_expires_at timestamptz
)
returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  v_email text := public.eret_customer_email_key(p_email);
  v_phone text := public.eret_customer_phone_key(p_phone);
  v_active boolean;
  v_redeemed integer;
  v_reserved integer;
begin
  select active, coalesce(used_count, 0) into v_active, v_redeemed
  from public.coupons where code = 'ERET10' for update;
  if not found then raise exception 'ERET10_NOT_CONFIGURED'; end if;
  if not v_active then raise exception 'ERET10_INACTIVE'; end if;
  perform public.eret_lock_customer_identity(p_email, p_phone);
  update public.promotion_redemptions set status = 'expired'
    where promotion_code = 'ERET10' and status = 'reserved'
      and stripe_session_id is null and expires_at <= now();

  if exists (select 1 from public.promotion_redemptions where id = p_reservation_id and status = 'reserved') then
    return jsonb_build_object('reserved', true);
  end if;

  if exists (
    select 1 from public.orders
    where public.eret_customer_email_key(email) = v_email
       or public.eret_customer_phone_key(phone) = v_phone
  ) then raise exception 'ERET10_NOT_FIRST_ORDER'; end if;

  if exists (
    select 1 from public.promotion_redemptions
    where promotion_code = 'ERET10' and status in ('reserved', 'redeemed')
      and (customer_email_key = v_email or customer_phone_key = v_phone)
  ) then raise exception 'ERET10_ALREADY_RESERVED'; end if;

  select count(*) into v_reserved from public.promotion_redemptions
  where promotion_code = 'ERET10' and status = 'reserved';
  if v_redeemed >= 30 then raise exception 'ERET10_SOLD_OUT'; end if;
  if v_redeemed + v_reserved >= 30 then raise exception 'ERET10_TEMPORARILY_RESERVED'; end if;

  insert into public.promotion_redemptions (
    id, promotion_code, customer_email_key, customer_phone_key, status, expires_at
  ) values (p_reservation_id, 'ERET10', v_email, v_phone, 'reserved', p_expires_at);
  return jsonb_build_object('reserved', true);
end $$;

create or replace function public.cancel_eret10_reservation(p_reservation_id uuid)
returns void language sql security definer
set search_path = public
as $$
  update public.promotion_redemptions set status = 'cancelled'
  where id = p_reservation_id and status = 'reserved';
$$;

create or replace function public.attach_eret10_stripe_session(
  p_reservation_id uuid, p_stripe_session_id text
)
returns jsonb language plpgsql security definer
set search_path = public
as $$
begin
  perform 1 from public.coupons where code = 'ERET10' for update;
  if not found then raise exception 'ERET10_NOT_CONFIGURED'; end if;
  update public.promotion_redemptions set stripe_session_id = p_stripe_session_id
  where id = p_reservation_id and status = 'reserved' and stripe_session_id is null;
  if not found then raise exception 'ERET10_INVALID_RESERVATION'; end if;
  return jsonb_build_object('attached', true);
end $$;

create or replace function public.cancel_eret10_stripe_reservation(p_stripe_session_id text)
returns void language sql security definer
set search_path = public
as $$
  update public.promotion_redemptions set status = 'cancelled'
  where stripe_session_id = p_stripe_session_id and status = 'reserved';
$$;

create or replace function public.eret_insert_order(p_order jsonb)
returns jsonb language plpgsql security definer
set search_path = public
as $$
declare v_order jsonb;
begin
  insert into public.orders (
    customer_name, phone, email, address, order_type, payment_method, items,
    total, status, comment, time_type, schedule_time
  ) values (
    p_order->>'customer_name', p_order->>'phone', p_order->>'email',
    coalesce(p_order->>'address', ''), coalesce(p_order->>'order_type', ''),
    p_order->>'payment_method', p_order->'items', (p_order->>'total')::numeric,
    coalesce(p_order->>'status', 'new'), coalesce(p_order->>'comment', ''),
    coalesce(p_order->>'time_type', ''), coalesce(p_order->>'schedule_time', '')
  ) returning to_jsonb(orders.*) into v_order;
  return v_order;
end $$;

create or replace function public.accept_eret10_cash_order(
  p_email text, p_phone text, p_request_id uuid, p_order jsonb
)
returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  v_email text := public.eret_customer_email_key(p_email);
  v_phone text := public.eret_customer_phone_key(p_phone);
  v_existing jsonb;
  v_order jsonb;
  v_active boolean;
  v_redeemed integer;
  v_reserved integer;
begin
  select active, coalesce(used_count, 0) into v_active, v_redeemed
  from public.coupons where code = 'ERET10' for update;
  if not found then raise exception 'ERET10_NOT_CONFIGURED'; end if;
  if not v_active then raise exception 'ERET10_INACTIVE'; end if;
  perform public.eret_lock_customer_identity(p_email, p_phone);
  select order_snapshot into v_existing from public.promotion_redemptions
    where cash_request_id = p_request_id and status = 'redeemed';
  if v_existing is not null then
    return jsonb_build_object('created', false, 'order', v_existing);
  end if;

  update public.promotion_redemptions set status = 'expired'
    where promotion_code = 'ERET10' and status = 'reserved'
      and stripe_session_id is null and expires_at <= now();
  if exists (
    select 1 from public.orders
    where public.eret_customer_email_key(email) = v_email
       or public.eret_customer_phone_key(phone) = v_phone
  ) then raise exception 'ERET10_NOT_FIRST_ORDER'; end if;
  if exists (
    select 1 from public.promotion_redemptions
    where promotion_code = 'ERET10' and status in ('reserved', 'redeemed')
      and (customer_email_key = v_email or customer_phone_key = v_phone)
  ) then raise exception 'ERET10_ALREADY_RESERVED'; end if;

  select count(*) into v_reserved from public.promotion_redemptions
  where promotion_code = 'ERET10' and status = 'reserved';
  if v_redeemed >= 30 then raise exception 'ERET10_SOLD_OUT'; end if;
  if v_redeemed + v_reserved >= 30 then raise exception 'ERET10_TEMPORARILY_RESERVED'; end if;

  v_order := public.eret_insert_order(p_order);
  insert into public.promotion_redemptions (
    promotion_code, customer_email_key, customer_phone_key, status,
    cash_request_id, order_snapshot, redeemed_at
  ) values ('ERET10', v_email, v_phone, 'redeemed', p_request_id, v_order, now());
  update public.coupons set used_count = coalesce(used_count, 0) + 1 where code = 'ERET10';
  return jsonb_build_object('created', true, 'order', v_order);
end $$;

create or replace function public.accept_eret10_stripe_order(
  p_reservation_id uuid, p_stripe_session_id text, p_order jsonb
)
returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  v_redemption public.promotion_redemptions%rowtype;
  v_order jsonb;
  v_redeemed integer;
begin
  select coalesce(used_count, 0) into v_redeemed
  from public.coupons where code = 'ERET10' for update;
  if not found then raise exception 'ERET10_NOT_CONFIGURED'; end if;
  select * into v_redemption from public.promotion_redemptions
    where stripe_session_id = p_stripe_session_id and status = 'redeemed';
  if found then return jsonb_build_object('created', false, 'order', v_redemption.order_snapshot); end if;

  select * into v_redemption from public.promotion_redemptions
    where id = p_reservation_id and stripe_session_id = p_stripe_session_id
      and status = 'reserved' for update;
  if not found then raise exception 'ERET10_INVALID_RESERVATION'; end if;

  v_order := public.eret_insert_order(p_order);
  update public.promotion_redemptions set
    status = 'redeemed', stripe_session_id = p_stripe_session_id,
    order_snapshot = v_order, redeemed_at = now()
  where id = p_reservation_id;
  update public.coupons set used_count = coalesce(used_count, 0) + 1 where code = 'ERET10';
  return jsonb_build_object('created', true, 'order', v_order);
end $$;

revoke all on table public.promotion_redemptions from anon, authenticated;
revoke all on table public.order_customer_locks from anon, authenticated;
revoke all on function public.eret_customer_email_key(text) from public, anon, authenticated;
revoke all on function public.eret_customer_phone_key(text) from public, anon, authenticated;
revoke all on function public.eret_lock_order_customer() from public, anon, authenticated;
revoke all on function public.eret_lock_customer_identity(text, text) from public, anon, authenticated;
revoke all on function public.eret_insert_order(jsonb) from public, anon, authenticated;
revoke all on function public.eret10_check_eligibility(text, text) from public, anon, authenticated;
revoke all on function public.reserve_eret10(text, text, uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.cancel_eret10_reservation(uuid) from public, anon, authenticated;
revoke all on function public.attach_eret10_stripe_session(uuid, text) from public, anon, authenticated;
revoke all on function public.cancel_eret10_stripe_reservation(text) from public, anon, authenticated;
revoke all on function public.accept_eret10_cash_order(text, text, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.accept_eret10_stripe_order(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.eret10_check_eligibility(text, text) to service_role;
grant execute on function public.reserve_eret10(text, text, uuid, timestamptz) to service_role;
grant execute on function public.cancel_eret10_reservation(uuid) to service_role;
grant execute on function public.attach_eret10_stripe_session(uuid, text) to service_role;
grant execute on function public.cancel_eret10_stripe_reservation(text) to service_role;
grant execute on function public.accept_eret10_cash_order(text, text, uuid, jsonb) to service_role;
grant execute on function public.accept_eret10_stripe_order(uuid, text, jsonb) to service_role;
