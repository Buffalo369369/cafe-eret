import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function sendPaymentRequestEmail({
  email,
  name,
  amount,
  orderDate,
  orderTime,
}: {
  email: string;
  name: string;
  amount: number;
  orderDate: string;
  orderTime: string;
}) {
  if (!email) return;

  await resend.emails.send({
    from: "ERET Café <orders@cafe-eret.de>",
    replyTo: process.env.REPLY_TO_EMAIL,
    to: email,
    subject: "Wichtige Information zu Ihrer Bestellung",

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
Wichtige Information zu Ihrer Bestellung
</h2>

<p>
Sehr geehrte Frau ${name},
</p>

<p>
vielen Dank noch einmal für Ihre Bestellung bei
<b>ERET Café</b>. ❤️
</p>

<p>
Leider haben wir heute festgestellt, dass bei unserem
Online-Bestellsystem ein technischer Fehler aufgetreten ist.
</p>

<p>
Ihre Bestellung vom
<b>${orderDate}</b>
um
<b>${orderTime}</b>
wurde erfolgreich angenommen,
zubereitet und ausgeliefert.
</p>

<p>
Nach unserem aktuellen Stand wurde die Zahlung
leider nicht erfolgreich abgeschlossen.
</p>

<p>
Wir möchten Sie daher herzlich bitten,
kurz Ihre Konto- oder Kreditkartenabrechnung
zu überprüfen.
</p>

<p>
Sollte der Betrag tatsächlich nicht abgebucht worden sein,
würden wir uns sehr freuen,
wenn Sie den offenen Betrag begleichen könnten.
</p>

<div style="
background:white;
padding:25px;
border-radius:18px;
margin-top:25px;
">

<h2 style="margin-top:0">
💰 Offener Betrag
</h2>

<h1 style="
color:#b88a5a;
margin:0;
">
${amount.toFixed(2)} €
</h1>

<br>

<b>Empfänger</b><br>
Serhii Eret

<br><br>

<b>IBAN</b><br>
DE81 3506 0386 1721 2100 02

<br><br>

<b>BIC</b><br>
GENODED1VRR

<br><br>

<b>Bank</b><br>
Volksbank Rhein-Ruhr eG

<br><br>

<b>Verwendungszweck</b><br>
Bestellung vom ${orderDate}, ${orderTime}

</div>

<p style="margin-top:30px;">
Sollte der Betrag bereits von Ihrem Konto
abgebucht worden sein,
antworten Sie bitte einfach auf diese E-Mail.
Wir prüfen den Vorgang selbstverständlich sofort.
</p>

<p>
Für die entstandenen Unannehmlichkeiten
möchten wir uns aufrichtig entschuldigen.
</p>

<p>
Als kleines Dankeschön erhalten Sie von uns
bei Ihrem nächsten Besuch einen Gutschein.
</p>

<p>
Vielen Dank für Ihr Verständnis,
Ihr Vertrauen und Ihre Ehrlichkeit.
</p>

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

ERET Café

<br>

Leineweberstr. 42–44

<br>

45468 Mülheim an der Ruhr

</div>

</div>
`,
  });
}