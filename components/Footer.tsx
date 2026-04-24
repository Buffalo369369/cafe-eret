"use client";

import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative text-[#f8f5ee] overflow-hidden">

      {/* BG */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/footer.jpg')" }}
      />

      {/* CLEAN OVERLAY (убрали кашу) */}
      <div className="absolute inset-0 bg-[#3b2418]/85" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-20 py-10 md:py-14">

        {/* GRID */}
        <div className="grid gap-8 md:grid-cols-3">

          {/* KONTAKT */}
          <div>
            <h3 className="text-base md:text-lg font-medium mb-3">
              Kontakt
            </h3>

            <p className="text-white/80 text-sm leading-relaxed">
              📍 Leineweberstr. 42-44 <br />
              45468 Mülheim an der Ruhr
            </p>

            <a
              href="tel:+4917659342961"
              className="block mt-2 text-white/90 hover:text-[#fce590] transition text-sm"
            >
              📞 017659342961
            </a>
          </div>

          {/* ZEITEN */}
          <div>
            <h3 className="text-base md:text-lg font-medium mb-3">
              Öffnungszeiten
            </h3>

            <p className="text-white/80 text-sm">
              Di – So: 10:00 – 17:00
            </p>
            <p className="text-white/50 text-sm mt-1">
              Montag: geschlossen
            </p>
          </div>

          {/* SOCIAL */}
          <div>
            <h3 className="text-base md:text-lg font-medium mb-3">
              Folgen Sie uns
            </h3>

            <div className="flex gap-3 mt-3">

              <a
                href="https://wa.me/4917659342961"
                target="_blank"
                className="w-10 h-10 rounded-full flex items-center justify-center 
                bg-white/10 hover:bg-white/20 transition"
              >
                <FaWhatsapp size={16} />
              </a>

              <a
                href="https://instagram.com/cafe_eret"
                target="_blank"
                className="w-10 h-10 rounded-full flex items-center justify-center 
                bg-white/10 hover:bg-white/20 transition"
              >
                <FaInstagram size={16} />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center 
                bg-white/10 hover:bg-white/20 transition"
              >
                <FaFacebookF size={14} />
              </a>

            </div>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="mt-8 mb-5 h-[1px] w-full bg-white/10" />

        {/* BOTTOM */}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-white/60">

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
    </footer>
  );
}