import Stripe from "stripe";
import { NextResponse } from "next/server";
import { saveOrder } from "@/lib/saveOrder";
import { sendOrderEmail } from "@/lib/sendOrderEmail";
import { incrementCouponUsage } from "@/lib/coupons";
import {
  centsToEuros,
  type Coupon,
  type OrderItem,
  type OrderPricing,
} from "@/lib/order-pricing";
import { sendOrderTelegram } from "@/lib/sendOrderTelegram";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(
      (event.data.object as Stripe.Checkout.Session).id
    );
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
    const meta = session.metadata || {};
    const pricing = pricingFromStripeSession(session, meta);
    const coupon: Coupon | null =
      meta.coupon && pricing.discountCents > 0
        ? { code: meta.coupon, type: "fixed", value: pricing.discount }
        : null;
    const orderItems: OrderItem[] = lineItems.data.map((item) => ({
      name: item.description || "Artikel",
      qty: item.quantity || 1,
      price: centsToEuros(Math.round((item.amount_total || 0) / (item.quantity || 1))),
    }));

    if (coupon) {
      orderItems.push({ name: `🎁 Gutschein: ${coupon.code}`, qty: 1, price: -pricing.discount });
    }

    const savedOrder = await saveOrder({
      customer_name: meta.name || "",
      phone: meta.phone || "",
      email: meta.email || "",
      address: meta.address || "",
      order_type: meta.deliveryType || "",
      payment_method: "card",
      comment: meta.comment || "",
      time_type: meta.timeType || "",
      schedule_date: meta.scheduleDate || "",
      schedule_time: meta.scheduleTime || "",
      items: orderItems,
      total: pricing.total,
      status: "new",
    });
    if (!savedOrder) throw new Error("Order could not be saved");

    await incrementCouponUsage(coupon);

    const visibleItems = orderItems.filter((item) => item.price >= 0);
    await Promise.allSettled([
      sendOrderTelegram({
        orderNumber: savedOrder.order_number,
        customer: {
          name: meta.name,
          phone: meta.phone,
          email: meta.email,
          address: meta.address,
          comment: meta.comment,
        },
        paymentMethod: "card",
        deliveryType: meta.deliveryType || "",
        timeType: meta.timeType || "",
        scheduleDate: meta.scheduleDate,
        scheduleTime: meta.scheduleTime,
        items: visibleItems.filter((item) => item.name !== "🚚 Lieferung"),
        pricing,
        coupon: coupon?.code,
      }),
      sendOrderEmail({
        email: meta.email || "",
        name: meta.name || "",
        orderNumber: savedOrder.order_number,
        items: visibleItems,
        total: pricing.total,
        discount: pricing.discount,
        coupon: coupon?.code,
        deliveryType: meta.deliveryType || "",
        paymentMethod: "card",
        timeType: meta.timeType || "",
        scheduleDate: meta.scheduleDate || "",
        scheduleTime: meta.scheduleTime || "",
        phone: meta.phone || "",
      }),
    ]);
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function pricingFromStripeSession(
  session: Stripe.Checkout.Session,
  meta: Stripe.Metadata
): OrderPricing {
  const readCents = (value: string | undefined) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  };
  const subtotalCents = readCents(meta.subtotalCents);
  const deliveryFeeCents = readCents(meta.deliveryFeeCents);
  const discountCents = readCents(meta.discountCents);
  const totalCents = session.amount_total ?? readCents(meta.totalCents);

  return {
    subtotal: centsToEuros(subtotalCents),
    deliveryFee: centsToEuros(deliveryFeeCents),
    discount: centsToEuros(discountCents),
    total: centsToEuros(totalCents),
    subtotalCents,
    deliveryFeeCents,
    discountCents,
    totalCents,
  };
}
