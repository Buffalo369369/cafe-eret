import Stripe from "stripe";
import { NextResponse } from "next/server";
import { saveOrder } from "@/lib/saveOrder";
import { sendOrderEmail } from "@/lib/sendOrderEmail";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY as string
);

export async function POST(req: Request) {

  const body = await req.text();

  const sig =
    req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

  } catch (err) {

    console.error(
      "Webhook error:",
      err
    );

    return NextResponse.json(
      { error: "Webhook error" },
      { status: 400 }
    );

  }

  // ✅ successful payment
  if (
    event.type ===
    "checkout.session.completed"
  ) {

    // 🔥 session + items
    const session = await stripe.checkout.sessions.retrieve(
  (event.data.object as Stripe.Checkout.Session).id,
  {
    expand: ["line_items"],
  }
);

const lineItems =
  await stripe.checkout.sessions.listLineItems(
    session.id,
    {
      limit: 100,
    }
  );

    const meta = session.metadata || {};

    // ✅ save to Supabase
    const savedOrder = await saveOrder({

  customer_name:
    meta.name || "",

  phone:
    meta.phone || "",

    email:

  meta.email || "",

  address:
    meta.address || "",

  order_type:
    meta.deliveryType || "",

  payment_method:
    "card",

  comment:
    meta.comment || "",

  time_type:
    meta.timeType || "",

  schedule_date:
    meta.scheduleDate || "",

  schedule_time:
    meta.scheduleTime || "",

  items: lineItems.data.map((i: any) => ({

  name: i.description,

  qty: i.quantity,

})),

  total:
    (session.amount_total || 0) / 100,

  status:
    "new",
});

    // ✅ send to Telegram
    await sendToTelegram(
  session,
  lineItems,
  savedOrder.order_number
);

const total =

  (session.amount_total || 0) / 100;

await sendOrderEmail({
  email: meta.email || "",

  name: meta.name || "",

  orderNumber: savedOrder.order_number,

  items:
    lineItems.data.map((i: any) => ({
      name: i.description,
      qty: i.quantity,
    })),

  total,

  deliveryType: meta.deliveryType || "",

  paymentMethod: "card",

  timeType: meta.timeType || "",

  scheduleDate: meta.scheduleDate || "",

  scheduleTime: meta.scheduleTime || "",

  phone: meta.phone || "",
});

  }

  return NextResponse.json({
    received: true,
  });
}

// 📩 TELEGRAM
async function sendToTelegram(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.ApiList<Stripe.LineItem>,
  orderNumber: number
) {

  const TELEGRAM_TOKEN =
    process.env.TELEGRAM_BOT_TOKEN!;

  const CHAT_ID =
    process.env.TELEGRAM_CHAT_ID!;

  // 🔢 order id


  // 🇩🇪 Germany time
  const time = new Date().toLocaleString(
    "de-DE",
    {
      timeZone: "Europe/Berlin",

      day: "2-digit",

      month: "2-digit",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit",
    }
  );

  // 🧾 items
  const itemsLines =

  lineItems.data.map(
      (i: any) =>
        `• ${i.description} x${i.quantity}`
    ) || [];

  // 💰 total
  const total =
    (session.amount_total || 0) / 100;

  // 📦 metadata
  const meta = session.metadata || {};

  const text = `
🛒 Новый заказ #${orderNumber}

🕒 ${time}

👤 ${meta.name || "-"}
📞 ${meta.phone || "-"}

${meta.deliveryType === "delivery"
  ? `📍 ${meta.address || "-"}`
  : ""}

💬 ${meta.comment || "-"}

💳 Karte

${meta.deliveryType === "pickup"
  ? "🥡 Abholung"
  : "🚚 Lieferung"}

${meta.timeType === "asap"
  ? "⚡ So schnell wie möglich"
  : `🕒 ${meta.scheduleDate} — ${meta.scheduleTime}`}

🧾 ЗАКАЗ:
${itemsLines.join("\n")}

💰 ИТОГО: ${total.toFixed(2)} €
`;

  try {

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
        }),
      }
    );

    if (!telegramRes.ok) {

      console.error(
        "Telegram API error"
      );

    }

  } catch (err) {

    console.error(
      "Telegram send error:",
      err
    );

  }
}