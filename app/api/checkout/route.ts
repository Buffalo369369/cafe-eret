import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const {
  items,
  form,
  deliveryType,
  timeType,
  scheduleDate,
  scheduleTime,
} = await req.json();

    // ❗ проверка товаров
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items" },
        { status: 400 }
      );
    }

    // ❗ проверка формы (очень желательно)
    if (

  !form?.name ||

  !form?.phone ||

  (deliveryType === "delivery" && !form?.address)

) {

  return NextResponse.json(

    { error: "Missing form data" },

    { status: 400 }

  );

}

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",

      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout`,

      metadata: {
  order: JSON.stringify({
    items,
    form,
    payment: "card",
    deliveryType,
    timeType,
    scheduleDate,
    scheduleTime,
  }),
},
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Stripe error" },
      { status: 500 }
    );
  }
}