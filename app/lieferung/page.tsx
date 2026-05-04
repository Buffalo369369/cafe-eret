"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export default function DeliveryPage() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -80]); // мягкий параллакс

  return (
    <main className="bg-[#e9dfcf]">

      {/* HERO */}
      <section className="
  relative
  h-[250px] md:h-[320px]
  flex items-center justify-center
  text-center
  overflow-hidden
">

        {/* PARALLAX */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y }} className="w-full h-[125%]">
            <div
              className="w-full h-full bg-cover bg-[center_top] md:bg-[center_80%]"
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

  className="

    relative z-10

    text-white text-3xl md:text-5xl font-semibold

    mt-15 md:mt-15

  "

>

  Lieferung & Abholung

</motion.h1>

      </section>

      {/* DELIVERY */}
      <section className="px-6 md:px-20 pt-6 pb-12 md:pt-10 md:pb-16 max-w-5xl mx-auto text-center">

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
      <section className="relative px-6 md:px-20 pt-6 pb-12 md:pt-10 md:pb-16 text-center overflow-hidden">

  {/* PAPER */}
  <div
    className="absolute inset-0 bg-cover bg-center opacity-60"
    style={{ backgroundImage: "url('/paper2.jpg')" }}
  />

  {/* МЯГКИЙ ЦВЕТ (очень прозрачный!) */}
  <div className="absolute inset-0 bg-[#e9dfcf]/40" />

  <div className="absolute inset-0 bg-gradient-to-b from-[#e9dfcf]/70 via-transparent to-[#e9dfcf]/70" />

  {/* CONTENT */}
  <div className="relative z-10">

    <h2 className="text-2xl md:text-4xl font-semibold text-[#2c2c2c] mb-4">
      Abholung
    </h2>

    <p className="text-[#5c4432] text-base md:text-lg max-w-xl mx-auto leading-relaxed">
      Du kannst deine Bestellung auch direkt bei uns abholen – schnell, einfach und ohne Wartezeit.
    </p>

  </div>

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
      <section className="px-6 md:px-20 pt-0 pb-6 text-center">

  <div className="bg-white/70 backdrop-blur-md rounded-2xl py-6 px-6 shadow-md max-w-md mx-auto">

    <h2 className="text-xl md:text-2xl font-semibold text-[#2c2c2c] mb-4">
      Jetzt bestellen 🛒
    </h2>

    <Link href="/menu">
      <button className="
        px-6 py-2.5
        rounded-full
        bg-gradient-to-r from-[#fce590] via-[#f4b740] to-[#cc5c06]
        text-[#2c2c2c]
        text-sm font-medium
        hover:scale-[1.05]
        transition
      ">
        Zur Speisekarte
      </button>
    </Link>

  </div>

</section>

    </main>
  );
}