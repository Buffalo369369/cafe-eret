-- Emergency application rollback companion. Review before use.
-- Preserves all orders and promotion audit rows while disabling new ERET10 use.

begin;
update public.coupons set active = false where code = 'ERET10';
drop trigger if exists orders_lock_customer_identity on public.orders;
commit;
