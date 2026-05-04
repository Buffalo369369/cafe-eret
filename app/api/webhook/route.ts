import Stripe from "stripe";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const order = JSON.parse(session.metadata?.order || "{}");

    await sendToTelegram(order);
  }

  return NextResponse.json({ received: true });
}

// 📩 TELEGRAM
async function sendToTelegram(order: any) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

  const itemsText = order.items
    ?.map((i: any) => `${i.name} x${i.qty}`)
    .join("\n");

  // ✅ ВОТ ЭТО ДОБАВЛЯЕМ
  const total = order.items.reduce(
  (sum: number, i: any) => sum + i.price * i.qty,
  0
);

const text = `
<b>Новый заказ (💳 Карта)</b>

<b>Имя:</b> ${order.form.name}
<b>Телефон:</b> ${order.form.phone}
<b>Адрес:</b> ${order.form.address}

<b>Заказ:</b>
${order.items.map((i: any) => `${i.name} x${i.qty}`).join("\n")}

<b>Сумма:</b> ${total.toFixed(2)} €
`;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  });
}