"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";


const menu = [
  {
    name: "Avocado Frühstück",
    price: "9,90 €",
    image: "/food1.jpg",
  },
  {
    name: "Griechischer Salat",
    price: "8,50 €",
    image: "/food2.jpg",
  },
  {
    name: "Hähnchen Sandwich",
    price: "7,50 €",
    image: "/food3.jpg",
  },
];

export default function Home() { const { scrollY } = useScroll();
const y = useTransform(scrollY, [0, 500], [0, -150]);
  return (
    
    <main>

      {/* HERO */}
     <section className="relative h-screen flex items-center px-6 md:px-20 overflow-hidden">

  {/* PARALLAX BACKGROUND */}
  <motion.div style={{ y }} className="absolute inset-0">
    <div
      className="w-full h-[120%] bg-cover bg-center"
      style={{ backgroundImage: "url('/hero.jpg')" }}
    />
  </motion.div>

  {/* OVERLAY */}
  <div className="absolute inset-0 bg-black/50" />

  {/* CONTENT */}
  <div className="relative z-10 max-w-2xl text-white">

    {/* TITLE */}
    <motion.h1
      initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1 }}
      className="text-5xl md:text-7xl font-semibold leading-[1.1] tracking-tight mb-6"
    >

      {/* MAIN */}
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="block bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent"
      >
        Frühstück & Brunch
      </motion.span>

      {/* SUB */}
      <motion.span
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.4 }}
        className="block text-xl md:text-3xl font-light text-white/80 tracking-[0.08em] mt-3 drop-shadow-sm"
      >
        in Mülheim an der Ruhr
      </motion.span>

    </motion.h1>

    {/* GOLD LINE */}
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "700px", opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mb-6"
    />

    {/* SUBTEXT */}
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="text-lg md:text-xl mb-8 text-white/75 max-w-md leading-relaxed tracking-wide"
    >
      Frisch & Lecker jeden Tag!
    </motion.p>

    {/* BUTTONS */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="flex gap-4"
    >
      <Link href="/menu">
        <button className="bg-[#c58a2c] hover:shadow-[0_0_20px_rgba(197,138,44,0.4)] text-white px-10 py-4 rounded-full transition duration-300 hover:scale-105 shadow-md">
          Jetzt bestellen
        </button>
      </Link>

      <Link href="/menu">
        <button className="bg-[#f5f1eb] hover:bg-[#ebe4d9] text-[#2c2c2c] px-6 py-3 rounded-full transition duration-300 hover:scale-105 border border-[#e5dccf]">
          Speisekarte ansehen
        </button>
      </Link>
    </motion.div>

  </div>
</section>

      {/* СПЕЦИАЛЬНОСТИ */}
      <section
  className="py-20 px-6 md:px-20 text-center bg-cover bg-center"
  style={{
    backgroundImage: "url('/paper.jpg')"
  }}
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
    transition={{
      duration: 0.6,
      delay: index * 0.2
    }}
    viewport={{ once: true }}
    className="group rounded-2xl overflow-hidden bg-white shadow-md transition duration-500 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
  >

    {/* IMAGE */}
    <div
      className="h-56 bg-cover bg-center transition duration-700 group-hover:scale-110"
      style={{ backgroundImage: `url(${item.image})` }}
    />

    {/* CONTENT */}
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