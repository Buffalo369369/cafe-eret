import { NextResponse } from "next/server";
import { saveOrder } from "@/lib/saveOrder";
import { sendOrderEmail } from "@/lib/sendOrderEmail";
import { supabaseAdmin } from "@/lib/supabase-admin";


export async function POST(req: Request) {
  try {
    const {
  items,
  form,
  payment,
  deliveryType,
  timeType,
  scheduleDate,
  scheduleTime,
  coupon,
} = await req.json();
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

    // 🔢 номер заказа
  

    // 🇩🇪 время Германии
    const time = new Date().toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // 🧾 строки заказа (как чек)
    const itemsLines = items.map(
      (i: any) =>
        `• ${i.name} x${i.qty} — ${(i.price * i.qty).toFixed(2)} €`
    );

    // 💰 сумма
    const total = items.reduce(
      (sum: number, i: any) => sum + i.price * i.qty,
      0
    );

    let savedOrder = null;

if (payment === "cash") {

  savedOrder = await saveOrder({

    customer_name:
      form?.name || "",

    phone:
      form?.phone || "",

      email:

        form?.email || "",

    address:
      form?.address || "",

    order_type:
      deliveryType || "",

    payment_method:
      "cash",

    items,

    total,

    status:
      "new",

    comment:
      form?.comment || "",

    time_type:
      timeType || "",

    schedule_date:
      scheduleDate || "",

    schedule_time:
      scheduleTime || "",

  });

}

if (coupon) {
  await supabaseAdmin.rpc("increment_coupon_usage", {
    coupon_code: coupon,
  });
}

if (payment === "cash" && savedOrder) {

  await sendOrderEmail({

    email: form?.email || "",

    name: form?.name || "",

    orderNumber: savedOrder.order_number,

    items,

    total,

    deliveryType,

    paymentMethod: "cash",

    timeType,

    scheduleDate: scheduleDate || "",

    scheduleTime: scheduleTime || "",

    phone: form?.phone || "",

  });

}
    
    const text = `
🛒 Новый заказ #${savedOrder?.order_number || ""}

🕒 ${time}

👤 ${form?.name || "-"}
📞 ${form?.phone || "-"}
📧 ${form?.email || "-"}
${deliveryType === "delivery"
  ? `📍 ${form?.address || "-"}`
  : ""}

💬 ${form?.comment || "-"}

💳 ${payment === "card" ? "Karte" : "Bar"}

${deliveryType === "pickup"
  ? "🥡 Abholung"
  : "🚚 Lieferung"}

${timeType === "asap"
  ? "⚡ So schnell wie möglich"
  : `🕒 ${scheduleDate} — ${scheduleTime}`}

🧾 ЗАКАЗ:
${itemsLines.join("\n")}

💰 ИТОГО: ${total.toFixed(2)} €
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
    console.error("Order error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}