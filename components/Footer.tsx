"use client";

import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative text-[#2c2c2c] overflow-hidden">

      {/* BG */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/paper.jpg')" }}
      />

      {/* ЛЁГКИЙ ГРАДИЕНТ (вместо грязного overlay) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#e9dfcf]/60 via-[#e9dfcf]/30 to-transparent" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-20 py-10 md:py-14">

        {/* GRID */}
        <div className="grid gap-8 md:grid-cols-3">

          {/* KONTAKT */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3">
              Kontakt
            </h3>

            <p className="text-[#2c2c2c]/80 text-sm leading-relaxed">
              📍 Leineweberstr. 42-44 <br />
              45468 Mülheim an der Ruhr
            </p>

            <a
              href="tel:+4917659342961"
              className="block mt-2 text-[#2c2c2c]/90 hover:text-[#cc5c06] transition text-sm"
            >
              📞 017659342961
            </a>
          </div>

          {/* ZEITEN */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3">
              Öffnungszeiten
            </h3>

            <p className="text-[#2c2c2c]/80 text-sm">
              Di – So: 10:00 – 17:00
            </p>
            <p className="text-[#2c2c2c]/50 text-sm mt-1">
              Montag: geschlossen
            </p>
          </div>

          {/* SOCIAL */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3">
              Folgen Sie uns
            </h3>

            <div className="flex gap-3 mt-3">

              <a
                href="https://wa.me/4917659342961"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center 
                bg-black/5 hover:bg-[#25D366] hover:text-white transition"
              >
                <FaWhatsapp size={16} />
              </a>

              <a
                href="https://instagram.com/cafe_eret"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center 
                bg-black/5 hover:bg-[#E4405F] hover:text-white transition"
              >
                <FaInstagram size={16} />
              </a>

              <a
                href="https://www.facebook.com/share/18Syq8Jxcd/?mibextid=LQQJ4d
                "
                className="w-10 h-10 rounded-full flex items-center justify-center 
                bg-black/5 hover:bg-[#1877F2] hover:text-white transition"
              >
                <FaFacebookF size={14} />
              </a>

            </div>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="mt-8 mb-5 h-[1px] w-full bg-gradient-to-r from-transparent via-[#b88a5a]/40 to-transparent" />

        {/* BOTTOM */}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-[#2c2c2c]/60">

          <span>© {new Date().getFullYear()} Café ERET</span>

          <Link href="/impressum" className="hover:text-[#cc5c06] transition">
            Impressum
          </Link>

          <Link href="/datenschutz" className="hover:text-[#cc5c06] transition">
            Datenschutz
          </Link>

          <Link href="/agb" className="hover:text-[#cc5c06] transition">
            AGB
          </Link>

        </div>
      </div>
    </footer>
  );
}