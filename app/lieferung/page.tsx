"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export default function DeliveryPage() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -80]); // мягкий параллакс

  return (
    <main className="bg-[#e9dfcf]">

      {/* HERO */}
      <section className="relative h-[250px] md:h-[320px] flex items-center justify-center text-center overflow-hidden">

        {/* PARALLAX */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y }} className="w-full h-[120%]">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: "url('/delivery.jpg')" }}
            />
          </motion.div>
        </div>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/50" />

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-white text-3xl md:text-5xl font-semibold"
        >
          Lieferung & Abholung
        </motion.h1>

      </section>

      {/* DELIVERY */}
      <section className="px-6 md:px-20 py-12 md:py-16 max-w-5xl mx-auto text-center">

        <h2 className="text-2xl md:text-4xl font-semibold text-[#2c2c2c] mb-6">
          Lieferung
        </h2>

        <div className="text-[#5c4432] space-y-2 text-base md:text-lg">
          <p>🚀 Schnelle Lieferung in ganz Mülheim</p>
          <p>💸 Kostenlose Lieferung ab 30 €</p>
          <p>⏱ Lieferzeit: ca. 30–45 Minuten</p>
        </div>

      </section>

      {/* PICKUP */}
      <section className="px-6 md:px-20 py-12 md:py-16 bg-[#f5eee4] text-center">

        <h2 className="text-2xl md:text-4xl font-semibold text-[#2c2c2c] mb-6">
          Abholung
        </h2>

        <p className="text-[#5c4432] text-base md:text-lg max-w-xl mx-auto">
          Du kannst deine Bestellung auch direkt bei uns abholen – schnell, einfach und ohne Wartezeit.
        </p>

      </section>

      {/* INFO GRID */}
      <section className="px-6 md:px-20 py-12 md:py-16 max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

        {/* ADDRESS */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-[#2c2c2c]">
            📍 Adresse
          </h3>

          <p className="text-[#5c4432]">
            Leineweberstr. 42-44 <br />
            45468 Mülheim an der Ruhr
          </p>
        </div>

        {/* HOURS */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-[#2c2c2c]">
            ⏰ Öffnungszeiten
          </h3>

          <p>
            ⏰ Di – So: 10:00 – 17:00
            <span className="block text-sm text-black/50">
              Montag: geschlossen
            </span>
          </p>
        </div>

      </section>

      {/* CTA */}
      <section className="px-6 md:px-20 py-16 text-center">

        <h2 className="text-2xl md:text-4xl font-semibold text-[#2c2c2c] mb-6">
          Jetzt bestellen
        </h2>

        <Link href="/menu">
          <button className="px-6 py-3 rounded-full bg-[#2c2c2c] text-white hover:bg-black transition">
            Zur Speisekarte
          </button>
        </Link>

      </section>

    </main>
  );
}