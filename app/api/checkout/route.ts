import Stripe from "stripe";
import { NextResponse } from "next/server";
import {
  calculateOrderPricing,
  type OrderItem,
} from "@/lib/order-pricing";
import {
  CouponValidationError,
  getValidCoupon,
} from "@/lib/coupons";
import {
  getOrderingAvailability,
  validateOrderTiming,
} from "@/lib/ordering-availability";
import {
  OrderValidationError,
  resolveOrderItems,
  validateCustomer,
  validateFulfilment,
} from "@/lib/order-validation";
import { resolveDeliveryQuoteFromAddress } from "@/lib/delivery-policy";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const now = new Date();
  const orderingAvailability = getOrderingAvailability(now);
  if (!orderingAvailability.isAvailable) {
    return NextResponse.json(
      { error: orderingAvailability.message, orderingAvailable: false },
      { status: 403 }
    );
  }

  try {
    const {
      items: requestedItems,
      form: requestedForm,
      deliveryType,
      timeType,
      selectedTime,
      scheduleDate: requestedDate,
      coupon: couponCode,
    } = await req.json();

    const timingError = validateOrderTiming({
      timeType,
      selectedTime,
      requestedDate,
      now,
    });
    if (timingError) {
      return NextResponse.json({ error: timingError }, { status: 400 });
    }

    validateFulfilment(deliveryType);
    const items = resolveOrderItems(requestedItems);
    const form = validateCustomer(requestedForm);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    let deliveryFee = 0;
    if (deliveryType === "delivery") {
      const rawAddress = typeof requestedForm?.address === "string" ? requestedForm.address.trim() : "";
      if (!rawAddress) throw new OrderValidationError("Bitte Lieferadresse angeben.");
      const quote = await resolveDeliveryQuoteFromAddress(rawAddress);
      if (!quote.available) throw new OrderValidationError("Lieferung nicht verfügbar");
      if (subtotal < 15) throw new OrderValidationError("Mindestbestellwert für Lieferung ist 15 €");
      deliveryFee = quote.fee;
      form.address = rawAddress;
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
        selectedTime: selectedTime || "",
        coupon: coupon?.code || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof CouponValidationError || error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Stripe error:", error);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
