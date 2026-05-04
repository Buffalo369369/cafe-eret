import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { items, form, payment } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const text = `
🛒 НОВЫЙ ЗАКАЗ

👤 ${form.name}
📞 ${form.phone}
📍 ${form.address}

💬 ${form.comment || "-"}

💳 ${payment}

🧾 ЗАКАЗ:
${items.map((i: any) => `${i.name} x${i.qty}`).join("\n")}

💰 ИТОГО: ${items.reduce((s: number, i: any) => s + i.price * i.qty, 0).toFixed(2)} €
`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
      }),
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}