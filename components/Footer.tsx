"use client";

import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative text-[#f8f5ee] overflow-hidden">

      {/* TOP FADE */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-16 
      bg-gradient-to-b from-[#e9dfcf]/15 via-[#e9dfcf]/5 to-transparent z-20" />

      {/* BG */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/footer.jpg')" }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-[#3b2418]/80 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />

      {/* LIGHT */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(255,210,120,0.25),transparent_70%)]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-20 py-12 md:py-20">

        {/* GRID */}
        <div className="grid gap-10 md:grid-cols-3">

          {/* KONTAKT */}
          <div>
            <h3 className="text-lg font-semibold mb-4 relative inline-block">
              Kontakt
              <span className="absolute left-0 -bottom-1 w-10 h-[2px] bg-gradient-to-r from-[#d4af37] via-[#fce590] to-[#d4af37]" />
            </h3>

            <p className="mb-3 text-white/80 leading-relaxed text-sm md:text-base">
              📍 Leineweberstr. 42-44 <br />
              45468 Mülheim an der Ruhr
            </p>

            <a
              href="tel:+4917659342961"
              className="block text-white/90 hover:text-[#fce590] transition text-sm md:text-base"
            >
              📞 017659342961
            </a>
          </div>

          {/* ZEITEN */}
          <div>
            <h3 className="text-lg font-semibold mb-4 relative inline-block">
              Öffnungszeiten
              <span className="absolute left-0 -bottom-1 w-10 h-[2px] bg-gradient-to-r from-[#d4af37] via-[#fce590] to-[#d4af37]" />
            </h3>

            <p className="text-white/80 text-sm md:text-base">
              Di – So: 10:00 – 17:00
            </p>
            <p className="text-white/50 mt-1 text-sm md:text-base">
              Montag: geschlossen
            </p>
          </div>

          {/* SOCIAL */}
          <div>
            <h3 className="text-lg font-semibold mb-4 relative inline-block">
              Folgen Sie uns
              <span className="absolute left-0 -bottom-1 w-10 h-[2px] bg-gradient-to-r from-[#d4af37] via-[#fce590] to-[#d4af37]" />
            </h3>

            <div className="flex gap-4 mt-4">

              <a
                href="https://wa.me/4917659342961"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-[#25D366] transition"
              >
                <FaWhatsapp />
              </a>

              <a
                href="https://instagram.com/cafe_eret"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-[#E4405F] transition"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                className="group w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-[#1877F2] transition"
              >
                <FaFacebookF />
              </a>

            </div>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="mt-12 mb-6 h-[1px] w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-60" />

        {/* BOTTOM (УЛУЧШЕН ДЛЯ МОБИЛКИ) */}
        <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-white/60">

          <span>© {new Date().getFullYear()} Café ERET</span>

          <Link href="/impressum" className="hover:text-[#fce590]">
            Impressum
          </Link>

          <Link href="/datenschutz" className="hover:text-[#fce590]">
            Datenschutz
          </Link>

          <Link href="/agb" className="hover:text-[#fce590]">
            AGB
          </Link>

        </div>
      </div>

      {/* BOTTOM FADE */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

    </footer>
  );
}