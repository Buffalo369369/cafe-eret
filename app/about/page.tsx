"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="bg-[#e9dfcf]">

      {/* HERO */}
      <section className="relative h-[300px] md:h-[400px] flex items-center justify-center text-center overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/about.jpg')" }}
        />

        <div className="absolute inset-0 bg-black/50" />

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-white text-3xl md:text-5xl font-semibold"
        >
          Über uns
        </motion.h1>
      </section>

      {/* TEXT */}
      <section className="px-6 md:px-20 py-12 md:py-16 max-w-4xl mx-auto text-center">
        <p className="text-[#5c4432] text-base md:text-lg leading-relaxed">
          Willkommen im ERET Café – einem Ort, an dem Frühstück mehr ist als nur eine Mahlzeit.
          Wir verbinden frische Zutaten, liebevolle Zubereitung und gemütliche Atmosphäre,
          um dir den perfekten Start in den Tag zu geben.
        </p>
      </section>

      {/* IMAGE + TEXT */}
      <section className="px-6 md:px-20 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">

        <img
          src="/about2.jpg"
          className="rounded-2xl shadow-lg"
        />

        <div className="text-[#5c4432] space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Unsere Philosophie
          </h2>

          <p>
            Qualität steht bei uns an erster Stelle. Wir verwenden nur frische Zutaten
            und bereiten jedes Gericht mit Sorgfalt zu.
          </p>

          <p>
            Ob ein entspanntes Frühstück oder ein schneller Kaffee – bei uns fühlst du dich wie zu Hause.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 md:px-20 py-12 md:py-16 max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

        {[
          "Frische Zutaten",
          "Schnelle Lieferung",
          "Gemütliche Atmosphäre",
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-2xl shadow-md text-center"
          >
            <p className="font-medium text-[#2c2c2c]">{item}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <section className="px-6 md:px-20 py-16 text-center">

        <h2 className="text-2xl md:text-4xl font-semibold text-[#2c2c2c] mb-6">
          Bereit zu bestellen?
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