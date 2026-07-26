import type { OrderItem, OrderPricing } from "@/lib/order-pricing";

export async function sendOrderTelegram({
  orderNumber,
  customer,
  paymentMethod,
  deliveryType,
  timeType,
  scheduleDate,
  scheduleTime,
  items,
  pricing,
  coupon,
}: {
  orderNumber: number;
  customer: { name?: string; phone?: string; email?: string; address?: string; comment?: string };
  paymentMethod: "cash" | "card";
  deliveryType: string;
  timeType: string;
  scheduleDate?: string;
  scheduleTime?: string;
  items: OrderItem[];
  pricing: OrderPricing;
  coupon?: string;
}) {
  const time = new Date().toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const itemsLines = items.map(
    (item) => `• ${item.name} x${item.qty} — ${(item.price * item.qty).toFixed(2)} €`
  );
  const text = `
🛒 Новый заказ #${orderNumber}

🕒 ${time}

👤 ${customer.name || "-"}
📞 ${customer.phone || "-"}
📧 ${customer.email || "-"}
${deliveryType === "delivery" ? `📍 ${customer.address || "-"}` : ""}

💬 ${customer.comment || "-"}

💳 ${paymentMethod === "card" ? "Karte" : "Bar"}

${deliveryType === "pickup" ? "🥡 Abholung" : "🚚 Lieferung"}
${timeType === "asap" ? "⚡ So schnell wie möglich" : `🕒 ${scheduleDate} — ${scheduleTime}`}

🧾 ЗАКАЗ:
${itemsLines.join("\n")}
${pricing.deliveryFee > 0 ? `\n🚚 Lieferung: ${pricing.deliveryFee.toFixed(2)} €` : ""}
${pricing.discount > 0 ? `\n🎁 Gutschein ${coupon}: -${pricing.discount.toFixed(2)} €` : ""}
💰 ИТОГО: ${pricing.total.toFixed(2)} €
`;

  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
    }
  );

  if (!response.ok) throw new Error("Telegram API error");
}
