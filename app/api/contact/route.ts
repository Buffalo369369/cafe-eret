import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  // ✅ validation
  if (
    !name ||
    !email ||
    !message
  ) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  // ✅ anti-spam
  if (message.length > 2000) {
    return NextResponse.json(
      { error: "Message too long" },
      { status: 400 }
    );
  }

  const text = `
<b>📩 Новое Сообщение</b>

<b>👤 ФИО:</b> ${name}
<b>📧 Email:</b> ${email}

<b>💬 Сообщение:</b>
${message}
`;

  const TELEGRAM_TOKEN =
    process.env.TELEGRAM_BOT_TOKEN!;

  const CHAT_ID =
    process.env.TELEGRAM_CHAT_ID!;

  try {

    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    return NextResponse.json({ ok: true });

  } catch (error) {

    return NextResponse.json(
      { ok: false },
      { status: 500 }
    );

  }
}