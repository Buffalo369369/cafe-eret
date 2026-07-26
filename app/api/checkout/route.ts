import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY as string
);

export async function POST(req: Request) {

  try {

  const {
  items,
  form,
  deliveryType,
  deliveryFee,
  timeType,
  scheduleDate,
  scheduleTime,
  coupon,
} = await req.json();

    // ✅ items validation
    if (!items || items.length === 0) {

      return NextResponse.json(
        { error: "No items" },
        { status: 400 }
      );

    }

    // ✅ form validation
    if (
      !form?.name ||
      !form?.phone ||
      (
        deliveryType === "delivery" &&
        !form?.address
      )
    ) {

      return NextResponse.json(
        { error: "Missing form data" },
        { status: 400 }
      );

    }

    const subtotal = items.reduce(
  (sum: number, item: any) => sum + item.price * item.qty,
  0
);

let discount = 0;

if (coupon) {
  const { data: couponData } = await supabaseAdmin
    .from("coupons")
    .select("type,value,active,used_count,usage_limit,expires_at")
    .eq("code", coupon)
    .single();

  if (
    couponData &&
    couponData.active &&
    (!couponData.expires_at ||
      new Date(couponData.expires_at) > new Date()) &&
    couponData.used_count < couponData.usage_limit
  ) {
    discount =
      couponData.type === "percent"
        ? subtotal * (couponData.value / 100)
        : couponData.value;
  }
}

// ✅ Stripe line items
    const line_items = items.map(
      (item: any) => {

        // ✅ basic security
        if (
          !item.price ||
          item.price <= 0 ||
          item.price > 500
        ) {
          throw new Error("Invalid price");
        }

        return {
          price_data: {
            currency: "eur",

            product_data: {
              name: item.name,
            },

            unit_amount: Math.round(
              item.price * 100
            ),
          },

          quantity: item.qty,
        };
      }
    );

    if (
  deliveryType === "delivery" &&
  Number(deliveryFee) > 0
) {
  line_items.push({
    price_data: {
      currency: "eur",
      product_data: {
        name: "🚚 Lieferung",
      },
      unit_amount: Math.round(
        Number(deliveryFee) * 100
      ),
    },
    quantity: 1,
  });
}



    // ✅ Stripe session
    const session =
      await stripe.checkout.sessions.create({

        customer_email: form.email,

        payment_method_types: ["card"],

        line_items,

        mode: "payment",

        success_url:
          `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${process.env.NEXT_PUBLIC_URL}/checkout`,

        metadata: {

          name: form.name,

          phone: form.phone,

          email: form.email,

          address: form.address || "",

          comment: form.comment || "",

          payment: "card",

          deliveryType,

          deliveryFee: String(deliveryFee || 0),

          timeType,

          scheduleDate:
            scheduleDate || "",

          scheduleTime:
            scheduleTime || "",

            coupon:
            coupon || "",
        },
      });

    return NextResponse.json({
      url: session.url,
    });

  } catch (err) {

    console.error("Stripe error:", err);

    return NextResponse.json(
      { error: "Stripe error" },
      { status: 500 }
    );

  }
}