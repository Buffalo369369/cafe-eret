"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const menu = [
  { name: "CROISSANTS MIT LACHS", price: "9 €", image: "/food1.jpg" },
  { name: "SALATE", price: "11,5 €", image: "/food2.jpg" },
  { name: "Hähnchen Sandwich", price: "7,50 €", image: "/food3.jpg" },
];

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -120]);

  return (
    <main>

      {/* HERO */}
      <section className="relative h-screen flex items-center px-6 md:px-20">

  {/* WRAPPER ДЛЯ ОБРЕЗКИ */}
  <div className="absolute inset-0 overflow-hidden">

    {/* PARALLAX */}
    <motion.div style={{ y }} className="w-full h-[120%]">
      <div
        className="w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      />
    </motion.div>

  </div>

  {/* OVERLAY */}
  <div className="absolute inset-0 bg-black/55" />

        {/* CONTENT */}
        <div className="relative z-10 max-w-2xl text-white">

          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight mb-6"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="block bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent"
            >
              Frühstück & Brunch
            </motion.span>

            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="block text-xl md:text-3xl font-light text-white/80 tracking-[0.08em] mt-3"
            >
              in Mülheim an der Ruhr
            </motion.span>
          </motion.h1>

          {/* GOLD LINE */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-md h-[2px] opacity-80 bg-gradient-to-r from-transparent via-[#fce590] to-transparent mb-6"
          />

          {/* SUBTEXT */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-lg md:text-xl mb-8 text-white/75 max-w-md leading-relaxed"
          >
            Frisch & Lecker jeden Tag!
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex gap-4 flex-wrap"
          >

            {/* 🟡 PRIMARY */}
            <Link href="/menu">
              <button className="relative px-10 py-4 rounded-full text-[#2c2c2c] font-medium overflow-hidden group transition duration-300 hover:scale-105 shadow-md hover:shadow-[0_10px_40px_rgba(255,200,80,0.4)]">

                <span className="absolute inset-0 bg-gradient-to-br from-[#fff3a3] via-[#f4b740] to-[#cc5c06] transition duration-700 group-hover:scale-110" />

                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 blur-xl bg-[radial-gradient(circle_at_30%_30%,rgba(255,240,150,0.8),transparent_60%)]" />

                <span className="absolute top-2 left-6 w-12 h-4 bg-white/40 blur-md rounded-full opacity-70 group-hover:translate-x-6 transition duration-700" />

                <span className="relative z-10 font-semibold tracking-wide">
                  Jetzt bestellen
                </span>
              </button>
            </Link>

            {/* ⚪ SILVER */}
            <Link href="/menu">
              <button className="relative group overflow-hidden px-10 py-4 rounded-full bg-gradient-to-r from-[#f5f5f5] via-[#e6e6e6] to-[#cfcfcf] text-[#2c2c2c] font-medium transition duration-500 hover:scale-105 shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.25)] ring-1 ring-white/40">

                {/* SHINE */}
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 animate-[shine_1.5s]" />
                </span>

                <span className="relative z-10">
                  Speisekarte ansehen
                </span>
              </button>
            </Link>

          </motion.div>
        </div> <div className="pointer-events-none absolute bottom-0 left-0 w-full h-2 
bg-gradient-to-b from-transparent via-[#fce590]/20 to-[#e9dfcf]" />
      </section>

      {/* СПЕЦИАЛЬНОСТИ */}
      <section
        className="py-20 px-6 md:px-20 text-center bg-cover bg-center"
        style={{ backgroundImage: "url('/paper.jpg')" }}
      >

        <div className="flex items-center justify-center mb-16 gap-6">
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-[#d4af37]" />
          <h2 className="text-4xl md:text-5xl font-semibold text-[#5c4432]">
            Unsere Spezialitäten
          </h2>
          <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-[#d4af37]" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {menu.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group rounded-2xl overflow-hidden bg-white shadow-md transition duration-500 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            >

              <div
                className="h-56 bg-cover bg-center transition duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.image})` }}
              />

              <div className="p-5 flex justify-between items-center relative">
                <h3 className="font-semibold text-lg text-[#2c2c2c]">
                  {item.name}
                </h3>

                <span className="font-bold text-[#b88a5a]">
                  {item.price}
                </span>

                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#d4af37] transition-all duration-500 group-hover:w-full" />
              </div> 
            </motion.div>
          ))}

        </div>
      </section>

      {/* ДОСТАВКА */}
      <section className="relative py-20 px-6 md:px-20 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('/delivery.jpg')" }}
        />

        <div className="relative z-10 max-w-4xl">
          <h2 className="text-4xl font-semibold mb-6">
            Lieferung in Mülheim
          </h2>

          <p className="mb-4">🚀 Schnelle Lieferung in ganz Mülheim</p>
          <p>💸 Kostenlose Lieferung ab 30 €</p>
        </div>
      </section>

    </main>
  );
}