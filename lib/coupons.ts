import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Coupon } from "@/lib/order-pricing";

type CouponRow = Coupon & {
  active: boolean;
  used_count: number | null;
  usage_limit: number | null;
  expires_at: string | null;
};

export class CouponValidationError extends Error {}

export function normalizeCouponCode(code: unknown) {
  return typeof code === "string" ? code.trim().toUpperCase() : "";
}

export async function getValidCoupon(code: unknown): Promise<Coupon | null> {
  const normalizedCode = normalizeCouponCode(code);
  if (!normalizedCode) return null;

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("code,type,value,active,used_count,usage_limit,expires_at")
    .eq("code", normalizedCode)
    .maybeSingle();

  const coupon = data as CouponRow | null;
  if (error || !coupon) {
    throw new CouponValidationError("Ungültiger Gutscheincode");
  }

  if (!coupon.active) {
    throw new CouponValidationError("Gutschein ist deaktiviert");
  }

  if (coupon.expires_at && new Date(coupon.expires_at) <= new Date()) {
    throw new CouponValidationError("Gutschein ist abgelaufen");
  }

  if (
    coupon.usage_limit !== null &&
    coupon.used_count !== null &&
    coupon.used_count >= coupon.usage_limit
  ) {
    throw new CouponValidationError("Gutschein wurde bereits verwendet");
  }

  if (
    (coupon.type !== "fixed" && coupon.type !== "percent") ||
    !Number.isFinite(Number(coupon.value)) ||
    Number(coupon.value) < 0
  ) {
    throw new CouponValidationError("Ungültiger Gutscheincode");
  }

  return {
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
  };
}

export async function incrementCouponUsage(coupon: Coupon | null) {
  if (!coupon) return;

  const { error } = await supabaseAdmin.rpc("increment_coupon_usage", {
    coupon_code: coupon.code,
  });

  if (error) {
    console.error("Coupon usage update failed:", error);
  }
}
