export default function AGBPage() {
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
          AGB
        </h1>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-white/30 space-y-6 text-[15px] leading-relaxed">

          <p>
            <strong>1. Geltungsbereich</strong><br />
            Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen über unsere Website.
          </p>

          <p>
            <strong>2. Vertragspartner</strong><br />
            Der Kaufvertrag kommt zustande mit Café ERET, Inhaber: Serhii Eret.
          </p>

          <p>
            <strong>3. Angebot und Vertragsschluss</strong><br />
            Die Darstellung der Produkte stellt kein rechtlich bindendes Angebot dar. Mit Ihrer Bestellung geben Sie ein verbindliches Angebot ab.
          </p>

          <p>
            <strong>4. Preise</strong><br />
            Alle Preise sind in Euro angegeben und enthalten die gesetzliche Mehrwertsteuer.
          </p>

          <p>
            <strong>5. Lieferung und Abholung</strong><br />
            Die Lieferung erfolgt innerhalb von Mülheim an der Ruhr. Alternativ ist eine Abholung vor Ort möglich.
          </p>

          <p>
            <strong>6. Zahlung</strong><br />
            Die Zahlung erfolgt bar oder über die angebotenen Zahlungsmethoden.
          </p>

          <p>
            <strong>7. Haftung</strong><br />
            Für Schäden haften wir nur bei Vorsatz oder grober Fahrlässigkeit.
          </p>

          <p>
            <strong>8. Schlussbestimmungen</strong><br />
            Es gilt deutsches Recht.
          </p>

        </div>
      </div>

      {/* BOTTOM FADE */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}