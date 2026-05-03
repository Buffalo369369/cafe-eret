export default function ImpressumPage() {
  return (
    <div className="relative min-h-screen text-[#2c2c2c] overflow-hidden">

      {/* 📜 PAPER BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/footer.jpg')" }}
      />

      {/* 🌫 SOFT OVERLAY */}
      <div className="absolute inset-0 bg-[#f8f5ee]/85 backdrop-blur-sm" />

      {/* ✨ LIGHT GLOW */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(255,210,120,0.15),transparent_70%)]" />
      </div>

      {/* ✨ TOP FADE (как между секциями) */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-16 
      bg-gradient-to-b from-black/40 to-transparent" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-20 py-32">

        <h1 className="text-4xl md:text-5xl font-semibold mb-12 text-[#5c4432] text-center tracking-tight">
          Impressum
        </h1>

        {/* 💎 CARD */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-white/30 space-y-8 text-[15px] leading-relaxed">

          <p>
            <strong>Angaben gemäß § 5 TMG:</strong><br />
            Café ERET<br />
            Inhaber: Serhii Eret<br />
            Leineweberstr. 42-44<br />
            45468 Mülheim an der Ruhr<br />
            Deutschland<br />
            USt-ID DE456815088
          </p>

          <p>
            <strong>Kontakt:</strong><br />
            Telefon: <a href="tel:+4917659342961">

  +49 176 5934 2961

</a><br />
            E-Mail: <a href="mailto:familiencafe.de@gmail.com">

  familiencafe.de@gmail.com

</a>
          </p>

          <p>
            <strong>Vertreten durch:</strong><br />
            Serhii Eret
          </p>

          <p>
            <strong>Aufsichtsbehörde:</strong><br />
            Ordnungsamt Mülheim an der Ruhr
          </p>

          <p>
            <strong>EU-Streitschlichtung:</strong><br />
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              className="text-[#b88a5a] underline hover:text-[#cc5c06] transition"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>

          <p>
            <strong>Verbraucherstreitbeilegung:</strong><br />
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <p>
            <strong>Haftung für Inhalte</strong><br />
            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
          </p>

          <p>
            <strong>Haftung für Links</strong><br />
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
          </p>

          <p>
            <strong>Urheberrecht</strong><br />
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
          </p>

        </div>
      </div>

      {/* 🔻 BOTTOM FADE */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-24 
      bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}