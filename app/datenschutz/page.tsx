export default function DatenschutzPage() {
  return (
    <div className="relative min-h-screen text-[#2c2c2c] overflow-hidden">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/footer.jpg')" }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-[#f8f5ee]/85 backdrop-blur-sm" />

      {/* LIGHT */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(255,210,120,0.15),transparent_70%)]" />
      </div>

      {/* TOP FADE */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/40 to-transparent" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-20 py-32">

        <h1 className="text-4xl md:text-5xl font-semibold mb-12 text-[#5c4432] text-center">
          Datenschutz
        </h1>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-white/30 text-[15px] leading-relaxed whitespace-pre-line">

{`Datenschutzerklärung
1. Datenschutz auf einen Blick
Allgemeine Hinweise
Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen 
Daten passiert, wenn Sie unsere Website besuchen oder über unseren Lieferdienst bestellen.
Datenerfassung auf dieser Website
Wer ist verantwortlich für die Datenerfassung auf dieser Website?
Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber:
Serhii Eret
Leineweberstr. 42-44 
45468 Mülheim an der Ruhr 
E-Mail: familiencafe.de@gmail.com
Telefon: +4917659342961
2. Allgemeine Hinweise und Pflichtinformationen
Datenschutz
Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen 
Datenschutzvorschriften (DSGVO, TDDDG) sowie dieser Datenschutzerklärung. Wenn Sie diese Website 
nutzen oder eine Bestellung aufgeben, werden verschiedene personenbezogene Daten erhoben.
Hinweis zur Datenweitergabe in die USA
Auf unserer Website sind Tools von Unternehmen mit Sitz in den USA (z. B. Vercel, Stripe) eingebunden. 
Wenn diese Tools aktiv sind, können Ihre personenbezogenen Daten an die US-Server der jeweiligen 
Unternehmen übertragen werden. Die Datenübertragung erfolgt auf Grundlage des EU-US Data Privacy 
Frameworks sowie der Standardvertragsklauseln der EU-Kommission. Wir weisen darauf hin, dass bei 
der Nutzung von US-Diensten ein Restrisiko bestehen kann, da kein mit der EU identisches 
Datenschutzniveau in allen Fällen garantiert werden kann.
Widerruf Ihrer Einwilligung zur Datenverarbeitung
Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können 
eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf 
erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
3. Datenerfassung bei Bestellung und Lieferung
Vertragsabwicklung
Wenn Sie in unserem Webshop bestellen, erheben wir folgende Daten zur Erfüllung des Kaufvertrags 
(Art. 6 Abs. 1 lit. b DSGVO):
• Name, Vorname
• Lieferadresse (Straße, Hausnummer, PLZ, Ort)
• E-Mail-Adresse (für die Bestellbestätigung)
• Telefonnummer (für Rückfragen zur Lieferung)
• Zahlungsdaten
Weitergabe an Dritte
Eine Weitergabe Ihrer Daten erfolgt an:
1. Lieferpersonal/Kurier: Zur Zustellung der Speisen.
2. Zahlungsdienstleister: Stripe
Wir haben auf unserer Website Komponenten von Stripe integriert. Anbieter für Kunden innerhalb der 
EU ist die Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland.
Art der Verarbeitung:
Stripe fungiert als Auftragsverarbeiter gemäß Art. 28 DSGVO. Wenn Sie eine Zahlungsmethode von 
Stripe wählen, werden Ihre Zahlungsdaten (z. B. Name, Adresse, Kontonummer, Kreditkartennummer) 
an Stripe übermittelt.
Übermittlung in Drittstaaten:
Wir weisen darauf hin, dass Stripe personenbezogene Daten auch an die Stripe, Inc. in die USA 
übertragen kann. Die Datenübertragung erfolgt auf Grundlage der Standardvertragsklauseln der EU-Kommission. Dies stellt sicher, dass Ihre Daten auch bei einer Verarbeitung außerhalb der EU einem 
angemessenen Schutzniveau entsprechen.
Rechtsgrundlage:
Die Datenweitergabe erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie auf 
Grundlage unseres berechtigten Interesses an der Verwendung zuverlässiger und sicherer 
Zahlungssysteme (Art. 6 Abs. 1 lit. f DSGVO).
Details zur Datenschutzerklärung von Stripe finden Sie unter: Stripe Datenschutzerklärung:
https://stripe.com/de/privacy.
3. Hosting-Anbieter: Zum Betrieb unserer Website.
4. Hosting und Server-Log-Dateien
Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.
Die Datenübertragung in die USA wird auf die Standardvertragsklauseln der EU-Kommission gestützt. 
Details finden Sie in der Datenschutzerklärung von Vercel unter: https://vercel.com/legal/privacy. 
(https://vercel.com/legal/privacy)
Mit dem Anbieter wurde ein Vertrag über Auftragsverarbeitung (AVV) gemäß Art. 28 DSGVO 
geschlossen.
Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
• Browsertyp und Browserversion
• verwendetes Betriebssystem
• Referrer URL
• Hostname des zugreifenden Rechners
• Uhrzeit der Serveranfrage
• IP-Adresse
Rechtsgrundlage:
Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse 
besteht in der technisch fehlerfreien Darstellung, der Optimierung unserer Website sowie der 
Gewährleistung der Sicherheit und Stabilität unserer informationstechnischen Systeme (z. B. zur Analyse 
und Abwehr von Hackerangriffen).
Speicherdauer:
Diese Daten werden nach spätestens 30 Tagen gelöscht, sofern sie nicht für Beweiszwecke bei 
Sicherheitsvorfällen länger benötigt werden.
5. Bereitstellung von personenbezogenen Daten
Im Rahmen unserer Geschäftsbeziehung müssen Sie diejenigen personenbezogenen Daten bereitstellen, 
die für die Aufnahme, Durchführung und Beendigung des Vertrages (Bestellung und Lieferung) 
erforderlich sind oder zu deren Erhebung wir gesetzlich verpflichtet sind.
Folgen der Nichtbereitstellung:
Ohne diese Daten (insbesondere Name, Lieferadresse und E-Mail-Adresse) werden wir in der Regel nicht 
in der Lage sein, einen Vertrag mit Ihnen zu schließen, Ihre Bestellung zu bearbeiten oder die Ware 
zuzustellen. Technisch notwendige Daten (z. B. IP-Adresse) sind zudem für den Besuch und die Nutzung 
der Website zwingend erforderlich.
6. Dauer der Speicherung
Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Erfüllung der oben genannten 
Zwecke (Bestellabwicklung und Zustellung) erforderlich ist.
• Vertragsabwicklung: Daten, die Sie uns zur Bestellung übermitteln, werden nach vollständiger 
Abwicklung des Vertrages gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
• Steuer- und handelsrechtliche Aufbewahrung: Aufgrund gesetzlicher Vorgaben (gemäß § 147 AO und § 
257 HGB) sind wir verpflichtet, Rechnungen, Buchungsbelege und vertragsrelevante Unterlagen für 
einen Zeitraum von 10 Jahren aufzubewahren. In dieser Zeit wird die Verarbeitung der Daten jedoch 
eingeschränkt (sie werden nur für das Finanzamt vorgehalten).
• Server-Log-Dateien: Diese werden aus Sicherheitsgründen (z. B. zur Aufklärung von Missbrauch oder 
Betrug) für eine Dauer von maximal 30 Tagen gespeichert und anschließend gelöscht.
7. Cookies und Web-Analyse
Notwendige Cookies (TDDDG)
Unsere Website verwendet technisch notwendige Cookies, um den Warenkorb und den Login-Status zu 
verwalten. Diese erfordern keine aktive Einwilligung, da der Dienst sonst nicht funktionieren würde.
Analyse-Tools (falls vorhanden)
Falls Sie Google Analytics oder ähnliche Tools nutzen, erfolgt dies nur nach Ihrer aktiven Zustimmung 
über den Cookie-Banner (Art. 6 Abs. 1 lit. a DSGVO).
8. Ihre Rechte (Betroffenenrechte)
Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf:
• Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO).
• Berichtigung unrichtiger Daten (Art. 16 DSGVO).
• Löschung Ihrer Daten, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen (Art. 17 DSGVO).
• Einschränkung der Verarbeitung (Art. 18 DSGVO).
• Datenübertragbarkeit (Art. 20 DSGVO).
Beschwerderecht bei der Aufsichtsbehörde
Im Falle von Datenschutzverstößen steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu. Für NRW ist dies:
Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW)
Kavalleriestr. 2-4, 40213 Düsseldorf.
Widerspruchsrecht gegen die Datenerhebung in besonderen Fällen sowie gegen Direktwerbung (Art. 21 DSGVO):
Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen.
9. SSL- bzw. TLS-Verschlüsselung
Diese Seite nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Damit sind Daten, die Sie an uns senden (z. B. Bestellungen), für Dritte nicht mitlesbar.
`}
        </div>
      </div>

      {/* BOTTOM FADE */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/40 to-transparent" />

    </div>
  );
}