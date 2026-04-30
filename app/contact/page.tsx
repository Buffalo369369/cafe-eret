"use client";

import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <main className="bg-[#e9dfcf]">

      {/* HERO */}
      <section className="relative h-[250px] md:h-[320px] flex items-center justify-center text-center overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/contact.jpg')" }}
        />

        <div className="absolute inset-0 bg-black/50" />

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-white text-3xl md:text-5xl font-semibold"
        >
          Kontakt
        </motion.h1>
      </section>

      {/* CONTACT INFO */}
      <section className="px-6 md:px-20 py-12 md:py-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

        {/* LEFT */}
        <div className="space-y-6">

          <h2 className="text-2xl md:text-4xl font-semibold text-[#2c2c2c]">
            Kontaktiere uns
          </h2>

          <div className="space-y-3 text-[#5c4432] text-base md:text-lg">

            <p>📍 Leineweberstr. 42-44<br />45468 Mülheim an der Ruhr</p>

            <a
              href="tel:+4917659342961"
              className="block hover:text-[#b88a5a] transition"
            >
              📞 017659342961
            </a>

            <a
  href="https://wa.me/4917659342961"
  target="_blank"
  rel="noopener noreferrer"
  className="block hover:text-[#b88a5a] transition"
>
  💬 WhatsApp schreiben
</a>

            <p>⏰ Mo–So: 08:00 – 18:00</p>

          </div>

        </div>

        {/* FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-md">

          <h3 className="text-lg font-semibold mb-4 text-[#2c2c2c]">
            Nachricht senden
          </h3>

          <form className="space-y-4">

            <input
              type="text"
              placeholder="Name"
              className="w-full border border-black/10 rounded-lg px-4 py-2 outline-none"
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full border border-black/10 rounded-lg px-4 py-2 outline-none"
            />

            <textarea
              placeholder="Nachricht"
              rows={4}
              className="w-full border border-black/10 rounded-lg px-4 py-2 outline-none"
            />

            <button
              type="submit"
              className="w-full py-2 rounded-full bg-[#2c2c2c] text-white hover:bg-black transition"
            >
              Senden
            </button>

          </form>

        </div>

      </section>

    </main>
  );
}