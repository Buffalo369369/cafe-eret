import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

type OrderItem = {
  name: string;
  qty: number;
};

export async function sendOrderEmail({
  email,
  name,
  orderNumber,
  items,
  total,
  deliveryType,
  paymentMethod,

timeType,

scheduleDate,

scheduleTime,

phone,

}: {

  email: string;

  name: string;

  orderNumber: number;

  items: OrderItem[];

  total: number;

  deliveryType: string;

  paymentMethod: string;

  timeType: string;

  scheduleDate: string;

  scheduleTime: string;

  phone: string;

}) {

  const itemsHtml = items
    .map(
      (i) =>
        `<li style="
margin-bottom:10px;
padding:10px;
background:#fff;
border-radius:12px;
">
🍽️ ${i.name} × ${i.qty}
</li>`
    )
    .join("");

  if (!email) return;
  
  await resend.emails.send({
    from: "ERET Café <orders@cafe-eret.de>",
    to: email,
    subject: `Bestellung #${orderNumber}`,

    html: `
<div style="
max-width:650px;
margin:auto;
background:#f8f5ee;
padding:40px;
font-family:Arial,sans-serif;
color:#5c4432;
border-radius:25px;
">

<div style="text-align:center">

<h1 style="
margin-bottom:10px;
font-size:36px;
letter-spacing:8px;
">
ERET
</h1>

<p style="
color:#8b735d;
margin-top:0;
font-size:14px;
">
Mehr als Kaffee & Kuchen...
</p>

</div>

<hr style="
border:none;
border-top:1px solid #e8dcc7;
margin:30px 0;
">

<h2>
☕ Vielen Dank für Ihre Bestellung!
</h2>

<p>
Hallo <b>${name}</b>,
</p>

<p>
Ihre Bestellung wurde erfolgreich aufgenommen und wird bereits vorbereitet ❤️
</p>

<div style="
background:white;
padding:20px;
border-radius:18px;
margin-top:25px;
">

<h3 style="margin-top:0">
🧾 Bestellung #${orderNumber}
</h3>

<ul style="
padding-left:0;
list-style:none;
">

${itemsHtml}

</ul>

</div>

<div style="
background:#fff9ef;
padding:20px;
border-radius:18px;
margin-top:25px;
">

<h2 style="margin-top:0">
💰 Gesamtbetrag
</h2>

<h1 style="
color:#b88a5a;
margin-bottom:0;
">
${total.toFixed(2)} €
</h1>

<p style="color:#7b6a58">
${deliveryType === "pickup"
  ? "🥡 Abholung"
  : "🚚 Lieferung"}
</p>

<p style="color:#7b6a58">
${paymentMethod === "card"
  ? "💳 Kartenzahlung"
  : "💶 Barzahlung"}
</p>

<p style="color:#7b6a58">
${timeType === "asap"
  ? "⚡ So schnell wie möglich"
  : `🕒 ${scheduleDate} ${scheduleTime}`}
</p>

<p style="color:#7b6a58">
📞 ${phone}
</p>


</div>

<div style="
margin-top:40px;
line-height:1.8;
">

<h3>
📍 ERET Café
</h3>

Leineweberstr. 42-44<br>
45468 Mülheim an der Ruhr

<br><br>

📷 Instagram:
<br>
<a
href="https://instagram.com/cafe_eret"
style="
color:#b88a5a;
text-decoration:none;
"
>
@cafe_eret
</a>

<br><br>

⭐ Hat Ihnen Ihr Frühstück gefallen?

Wir würden uns sehr über eine Bewertung freuen ❤️

<br><br>

<a
href="https://g.page/r/CQTs9aCIXbB-EBM/review"
style="
display:inline-block;
padding:14px 24px;
background:#b88a5a;
color:white;
border-radius:999px;
text-decoration:none;
font-weight:bold;
"
>
⭐ Jetzt bewerten
</a>

</div>

<hr style="
border:none;
border-top:1px solid #e8dcc7;
margin:35px 0;
">

<div style="
font-size:13px;
color:#8b735d;
text-align:center;
">

Vielen Dank ❤️

<br><br>

ERET Café

</div>

</div>
`,
  });
}