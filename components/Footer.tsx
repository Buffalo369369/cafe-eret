"use client";

import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative text-[#f8f5ee] overflow-hidden">

      {/* ✨ МЯГКИЙ ПЕРЕХОД СВЕРХУ (ВАЖНО) */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-16 
bg-gradient-to-b from-[#e9dfcf]/15 via-[#e9dfcf]/5 to-transparent z-20" />

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/footer.jpg')" }}
      />

      {/* GLASS */}
      <div className="absolute inset-0 bg-[#3b2418]/80 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />

      {/* GOLD LIGHT */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(255,210,120,0.25),transparent_70%)]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-20 py-20">

        {/* glow снизу */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#d4af37]/10 blur-3xl pointer-events-none" />

        <div className="grid md:grid-cols-3 gap-12">

          {/* KONTAKT */}
          <div>
            <h3 className="text-lg font-semibold mb-5 relative inline-block">
              Kontakt
              <span className="absolute left-0 -bottom-1 w-10 h-[2px] bg-gradient-to-r from-[#d4af37] via-[#fce590] to-[#d4af37]" />
            </h3>

            <p className="mb-3 text-white/80 leading-relaxed">
              📍 Leineweberstr. 42-44 <br />
              45468 Mülheim an der Ruhr
            </p>

            <a
              href="tel:017659342961"
              className="block text-white/90 hover:text-[#fce590] transition"
            >
              📞 017659342961
            </a>
          </div>

          {/* ZEITEN */}
          <div>
            <h3 className="text-lg font-semibold mb-5 relative inline-block">
              Öffnungszeiten
              <span className="absolute left-0 -bottom-1 w-10 h-[2px] bg-gradient-to-r from-[#d4af37] via-[#fce590] to-[#d4af37]" />
            </h3>

            <p className="text-white/80">Di – So: 10:00 – 17:00</p>
            <p className="text-white/50 mt-1">Montag: geschlossen</p>

            <div className="mt-4 h-[1px] w-20 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-60" />
          </div>

          {/* SOCIAL */}
          <div>
            <h3 className="text-lg font-semibold mb-5 relative inline-block">
              Folgen Sie uns
              <span className="absolute left-0 -bottom-1 w-10 h-[2px] bg-gradient-to-r from-[#d4af37] via-[#fce590] to-[#d4af37]" />
            </h3>

            <div className="flex gap-4 mt-5">

              {/* WhatsApp */}
              <a
                href="https://wa.me/4917659342961"
                target="_blank"
                className="group relative w-12 h-12 rounded-full flex items-center justify-center bg-white/10 border border-white/10 hover:border-transparent hover:bg-[#25D366] transition duration-300 ease-out hover:scale-110"
              >
                <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition blur-xl bg-[#25D366]/40" />
                <FaWhatsapp className="text-lg z-10" />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/cafe_eret"
                className="group relative w-12 h-12 rounded-full flex items-center justify-center bg-white/10 border border-white/10 hover:border-transparent hover:bg-[#E4405F] transition duration-300 ease-out hover:scale-110"
              >
                <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition blur-xl bg-[#E4405F]/40" />
                <FaInstagram className="text-lg z-10" />
              </a>

              {/* Facebook */}
              <a
                href="#"
                className="group relative w-12 h-12 rounded-full flex items-center justify-center bg-white/10 border border-white/10 hover:border-transparent hover:bg-[#1877F2] transition duration-300 ease-out hover:scale-110"
              >
                <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition blur-xl bg-[#1877F2]/40" />
                <FaFacebookF className="text-lg z-10" />
              </a>

            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="mt-16 mb-6 h-[1px] w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-60" />

        {/* BOTTOM */}
        <div className="text-center text-sm text-white/60 space-x-4">
          <span>© {new Date().getFullYear()} Café ERET</span>
          <span>•</span>
          <span className="hover:text-[#fce590] cursor-pointer">Impressum</span>
          <span>•</span>
          <span className="hover:text-[#fce590] cursor-pointer">Datenschutz</span>
          <span>•</span>
          <span className="hover:text-[#fce590] cursor-pointer">AGB</span>
        </div>
      </div>

      {/* НИЖНИЙ FADE */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

    </footer>
  );
}