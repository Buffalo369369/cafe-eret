export default function DatenschutzPage() {

  return (

    <div className="relative min-h-screen text-[#2c2c2c] overflow-hidden">

      {/* 📜 BACKGROUND */}

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

        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-white/30 space-y-6 text-[15px] leading-relaxed">

          <p>

            Der Schutz Ihrer persönlichen Daten ist uns sehr wichtig. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.

          </p>

          <p>

            <strong>1. Verantwortlicher</strong><br />

            Café ERET<br />

            Inhaber: Serhii Eret<br />

            Leineweberstr. 42-44<br />

            45468 Mülheim an der Ruhr

          </p>

          <p>

            <strong>2. Datenerfassung</strong><br />

            Ihre Daten werden erhoben, wenn Sie uns diese mitteilen (z.B. über ein Kontaktformular oder eine Bestellung).

          </p>

          <p>

            <strong>3. Nutzung der Daten</strong><br />

            Die Daten werden verwendet, um Ihre Anfrage zu bearbeiten und unseren Service bereitzustellen.

          </p>

          <p>

            <strong>4. Speicherdauer</strong><br />

            Ihre Daten werden nur so lange gespeichert, wie dies für die jeweiligen Zwecke erforderlich ist.

          </p>

          <p>

            <strong>5. Ihre Rechte</strong><br />

            Sie haben jederzeit das Recht auf Auskunft, Berichtigung oder Löschung Ihrer gespeicherten Daten.

          </p>

          <p>

            <strong>6. Cookies</strong><br />

            Unsere Website verwendet Cookies, um die Benutzerfreundlichkeit zu verbessern.

          </p>

        </div>

      </div>

      {/* BOTTOM FADE */}

      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/40 to-transparent" />

    </div>

  );

}