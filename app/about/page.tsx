"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export default function AboutPage() {

  // PARALLAX
  const { scrollY } = useScroll();

  const y = useTransform(scrollY, [0, 500], [0, -120]);

  const images = [
    "/about1.jpg",
    "/about3.jpg",
    "/about4.jpg",
    "/about5.jpg",
    "/about6.jpg",
    "/about7.jpg",
  ];

  return (
    <main className="bg-[#e9dfcf] overflow-hidden">

      {/* HERO */}
      <section className="relative h-[250px] md:h-[320px] flex items-center justify-center text-center overflow-hidden">

        {/* PARALLAX */}
        <div className="absolute inset-0 overflow-hidden">

          <motion.div
            style={{ y }}
            className="w-full h-[120%]"
          >
            <div
  className="
    w-full h-full
    bg-cover
    bg-center
    md:bg-[center_68%]
  "
  style={{ backgroundImage: "url('/about.jpg')" }}
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
            text-white
            text-4xl md:text-6xl
            font-semibold
            mt-10
          "
        >
          Über uns
        </motion.h1>

      </section>

      {/* INTRO */}
      <section className="

  px-6 md:px-20

  py-8 md:py-16

  max-w-4xl

  mx-auto

  text-center

">

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="
            text-[#5c4432]
            text-base md:text-xl
            leading-relaxed
          "
        >
          Willkommen im ERET Café – einem Ort,
          an dem Frühstück mehr ist als nur
          eine Mahlzeit.

          Wir verbinden frische Zutaten,
          liebevolle Zubereitung und eine warme,
          gemütliche Atmosphäre, um dir
          den perfekten Start in den Tag
          zu schenken.
        </motion.p>

      </section>

      {/* CAROUSEL */}
      <section className="px-6 md:px-20 py-6 md:py-10">

        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
          }}
          className="rounded-3xl overflow-hidden"
        >

          {images.map((img, i) => (
            <SwiperSlide key={i}>

              <div className="overflow-hidden rounded-3xl shadow-xl">

                <img

  src={img}

  alt="Café ERET"
                  className="
                    w-full
                    h-[260px] md:h-[420px]
                    object-cover
                    hover:scale-105
                    transition duration-700
                  "
                />

              </div>

            </SwiperSlide>
          ))}

        </Swiper>

      </section>

      {/* PHILOSOPHY */}
      <section className="

  px-6 md:px-20

  py-8 md:py-16

  max-w-4xl

  mx-auto

  text-center

">

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-[#5c4432] space-y-6"
  >

    <h2 className="
      text-3xl md:text-5xl
      font-semibold
      text-[#2c2c2c]
    ">
      Unsere Philosophie
    </h2>

    <p className="text-lg leading-relaxed">
      Qualität steht bei uns
      an erster Stelle.

      Wir verwenden frische Zutaten
      und bereiten jedes Gericht
      mit viel Liebe zum Detail zu.
    </p>

    <p className="text-lg leading-relaxed">
      Ob entspanntes Frühstück,
      gemütlicher Brunch oder
      schneller Kaffee —
      bei uns sollst du dich
      wie zuhause fühlen.
    </p>

  </motion.div>

</section>

      {/* FEATURES */}
      <section className="

  px-6 md:px-20

  py-4 md:py-12

  max-w-6xl

  mx-auto
        grid md:grid-cols-3
        gap-6
      ">

        {[
          "Frische Zutaten",
          "Schnelle Lieferung",
          "Gemütliche Atmosphäre",
        ].map((item, i) => (

          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              bg-white/80
              backdrop-blur-md
              p-8
              rounded-3xl
              shadow-lg
              text-center
            "
          >

            <p className="
              font-medium
              text-[#2c2c2c]
              text-lg
            ">
              {item}
            </p>

          </motion.div>

        ))}

      </section>

      {/* CTA */}
      <section className="px-6 md:px-20 py-10 md:py-16 text-center">

  <motion.h2
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-2xl md:text-4xl font-semibold text-[#2c2c2c] mb-6"
  >
    Bereit zu bestellen?
  </motion.h2>

 <Link href="/menu">
  <button
    className="
      px-8 py-3
      rounded-full
      bg-gradient-to-r
      from-[#fff3a3]
      via-[#f4b740]
      to-[#cc5c06]
      text-[#2c2c2c]
      font-medium
      shadow-md
      hover:scale-105
      transition
    "
  >
    Zur Speisekarte
  </button>
</Link>

</section>

    </main>
  );
}