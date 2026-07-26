import { NextResponse } from "next/server";
import {
  CouponValidationError,
  getValidCoupon,
} from "@/lib/coupons";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const coupon = await getValidCoupon(code);

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        message: "Bitte Gutscheincode eingeben",
      });
    }

    return NextResponse.json({ valid: true, coupon });
  } catch (error) {
    const message =
      error instanceof CouponValidationError
        ? error.message
        : "Gutschein konnte nicht geprüft werden";

    return NextResponse.json({ valid: false, message });
  }
}
