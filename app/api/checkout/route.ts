import Stripe from "stripe";
import { NextResponse } from "next/server";
import {
  calculateOrderPricing,
  type OrderItem,
} from "@/lib/order-pricing";
import {
  CouponValidationError,
  getValidCoupon,
  normalizeCouponCode,
} from "@/lib/coupons";
import {
  ERET10_CODE,
  Eret10ValidationError,
  attachEret10StripeSession,
  cancelEret10Reservation,
  requireEret10RequestId,
  reserveEret10,
} from "@/lib/eret10";
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

  let eret10ReservationId: string | null = null;
  let stripeSessionCreated = false;

  try {
    const {
      items: requestedItems,
      form: requestedForm,
      deliveryType,
      timeType,
      selectedTime,
      scheduleDate: requestedDate,
      coupon: couponCode,
      promotionRequestId,
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

    const isEret10 = normalizeCouponCode(couponCode) === ERET10_CODE;
    // Stripe requires at least 30 minutes. Five minutes of margin avoids a
    // boundary rejection between calculating and creating the session.
    const stripeExpiresAt = Math.floor((now.getTime() + 35 * 60_000) / 1000);
    const coupon = isEret10
      ? await reserveEret10({
          email: form.email,
          phone: form.phone,
          reservationId: requireEret10RequestId(promotionRequestId),
          expiresAt: new Date(now.getTime() + 45 * 60_000).toISOString(),
        })
      : await getValidCoupon(couponCode);
    if (isEret10) eret10ReservationId = requireEret10RequestId(promotionRequestId);
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
      ...(isEret10 ? { expires_at: stripeExpiresAt } : {}),
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
        promotionReservationId: eret10ReservationId || "",
      },
    });
    if (eret10ReservationId) {
      try {
        await attachEret10StripeSession(eret10ReservationId, session.id);
      } catch (error) {
        await stripe.checkout.sessions.expire(session.id).catch(() => null);
        throw error;
      }
    }
    stripeSessionCreated = true;

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (eret10ReservationId && !stripeSessionCreated) {
      await cancelEret10Reservation(eret10ReservationId);
    }

    if (
      error instanceof CouponValidationError ||
      error instanceof Eret10ValidationError ||
      error instanceof OrderValidationError
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Stripe error:", error);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
