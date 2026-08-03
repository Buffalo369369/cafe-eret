import Stripe from "stripe";
import { NextResponse } from "next/server";
import {
  calculateOrderPricing,
  isValidOrderItem,
  type OrderItem,
} from "@/lib/order-pricing";
import {
  CouponValidationError,
  getValidCoupon,
} from "@/lib/coupons";
import {
  getOrderingAvailability,
  VACATION_NOTICE,
} from "@/lib/ordering-availability";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  if (!getOrderingAvailability().isAvailable) {
    return NextResponse.json(
      { error: VACATION_NOTICE, orderingAvailable: false },
      { status: 403 }
    );
  }

  try {
    const {
      items,
      form,
      deliveryType,
      deliveryFee: requestedDeliveryFee,
      timeType,
      scheduleDate,
      scheduleTime,
      coupon: couponCode,
    } = await req.json();

    if (!Array.isArray(items) || items.length === 0 || !items.every(isValidOrderItem)) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    if (
      !form?.name ||
      !form?.phone ||
      !form?.email ||
      (deliveryType === "delivery" && !form?.address)
    ) {
      return NextResponse.json({ error: "Missing form data" }, { status: 400 });
    }

    const deliveryFee =
      deliveryType === "delivery" ? Number(requestedDeliveryFee) : 0;
    if (!Number.isFinite(deliveryFee) || deliveryFee < 0 || deliveryFee > 50) {
      return NextResponse.json({ error: "Invalid delivery fee" }, { status: 400 });
    }

    const coupon = await getValidCoupon(couponCode);
    const pricing = calculateOrderPricing({
      items: items as OrderItem[],
      deliveryFee,
      coupon,
    });

    const line_items: NonNullable<
      NonNullable<Parameters<typeof stripe.checkout.sessions.create>[0]>["line_items"]
    > = items.map(
      (item: OrderItem) => ({
        price_data: {
          currency: "eur",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })
    );

    if (pricing.deliveryFeeCents > 0) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: { name: "🚚 Lieferung" },
          unit_amount: pricing.deliveryFeeCents,
        },
        quantity: 1,
      });
    }

    // Stripe discounts must reference Stripe coupons. Create a one-time coupon
    // from the already validated local coupon, so Stripe charges the same total.
    const stripeCoupon =
      pricing.discountCents > 0
        ? await stripe.coupons.create({
            amount_off: pricing.discountCents,
            currency: "eur",
            duration: "once",
            name: coupon?.code,
          })
        : null;

    const session = await stripe.checkout.sessions.create({
      customer_email: form.email,
      payment_method_types: ["card"],
      line_items,
      ...(stripeCoupon ? { discounts: [{ coupon: stripeCoupon.id }] } : {}),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout`,
      metadata: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address || "",
        comment: form.comment || "",
        payment: "card",
        deliveryType: deliveryType || "",
        deliveryFeeCents: String(pricing.deliveryFeeCents),
        subtotalCents: String(pricing.subtotalCents),
        discountCents: String(pricing.discountCents),
        totalCents: String(pricing.totalCents),
        timeType: timeType || "",
        scheduleDate: scheduleDate || "",
        scheduleTime: scheduleTime || "",
        coupon: coupon?.code || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof CouponValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Stripe error:", error);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
