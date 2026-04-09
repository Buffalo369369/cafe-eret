"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";



export default function Header() {
    const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-300 ${
        scrolled
          ? "bg-[#f5f1eb]/95 backdrop-blur-md shadow-md"
          : "bg-gradient-to-b from-black/95 via-black/85 to-black/50 backdrop-blur-lg"
      }`}
    >
      {/* ✨ GOLD GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.15),transparent_60%)] pointer-events-none" />

      {/* 🔻 тонкая линия снизу */}
      <div
        className={`absolute bottom-0 left-0 w-full h-[1px] transition-all duration-300 ${
          scrolled ? "bg-black/10" : "bg-white/10"
        }`}
      />

      {/* CONTENT */}
      <div className="relative max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

        {/* ЛОГО */}
        <Link
          href="/"
          className={`text-3xl md:text-4xl font-bold tracking-[0.3em] transition duration-300 ${
            scrolled ? "text-black" : "text-white/90"
          }`}
        >
          ERET
        </Link>

        {/* МЕНЮ */}
        <nav className="hidden md:flex gap-10 text-lg font-medium">
  {[
    { href: "/", label: "Startseite" },
    { href: "/menu", label: "Speisekarte" },
    { href: "/about", label: "Über uns" },
    { href: "/contact", label: "Kontakt" },
  ].map((item) => {
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`relative group transition duration-300 ${
          isActive
            ? "text-[#d4af37]" // 🟡 активный — золотой
            : scrolled
            ? "text-black/80 hover:text-black"
            : "text-white/80 hover:text-white"
        }`}
      >
        {item.label}

        {/* 🔥 GOLD UNDERLINE */}
        <span
          className={`absolute left-0 -bottom-1 h-[1px] bg-[#d4af37] transition-all duration-300 ${
            isActive ? "w-full" : "w-0 group-hover:w-full"
          }`}
        />
      </Link>
    );
  })}
</nav>

        {/* КНОПКА */}
        <Link
          href="/menu"
          className={`px-6 py-2 rounded-full backdrop-blur-md transition duration-300 ${
            scrolled
              ? "border border-black/30 text-black hover:border-[#d4af37] hover:text-[#d4af37]"
              : "border border-white/30 text-white hover:border-[#d4af37] hover:text-[#d4af37]"
          } hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]`}
        >
          Online bestellen
        </Link>

      </div>
    </header>
  );
}