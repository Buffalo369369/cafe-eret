import { NextResponse } from "next/server";
import {
  CouponValidationError,
  getValidCoupon,
  normalizeCouponCode,
} from "@/lib/coupons";
import {
  ERET10_CODE,
  Eret10ValidationError,
  checkEret10Eligibility,
} from "@/lib/eret10";

export async function POST(req: Request) {
  try {
    const { code, email, phone } = await req.json();
    const coupon =
      normalizeCouponCode(code) === ERET10_CODE
        ? await checkEret10Eligibility(email, phone)
        : await getValidCoupon(code);

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        message: "Bitte Gutscheincode eingeben",
      });
    }

    return NextResponse.json({ valid: true, coupon });
  } catch (error) {
    const message =
      error instanceof CouponValidationError || error instanceof Eret10ValidationError
        ? error.message
        : "Gutschein konnte nicht geprüft werden";

    return NextResponse.json({ valid: false, message });
  }
}
