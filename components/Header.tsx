"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-500 ease-out ${
        scrolled
          ? "bg-[#e9dfcf]/85 backdrop-blur-md shadow-[0_6px_30px_rgba(120,90,60,0.15)] border-b border-[#d6c7b2]"
          : "bg-gradient-to-b from-black/95 via-black/85 to-black/50 backdrop-blur-lg"
      }`}
    >
      {/* ✨ WARM LIGHT */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(255,210,120,0.25),transparent_65%)]" />
      </div>

      {/* CONTENT */}
      <div
        className={`relative max-w-7xl mx-auto flex items-center justify-between px-8 transition-all duration-500 ${
          scrolled ? "py-3" : "py-4"
        }`}
      >
        {/* ЛОГО */}
        <Link
          href="/"
          className={`font-bold tracking-[0.3em] transition duration-300 ${
            scrolled ? "text-black" : "text-white"
          } ${scrolled ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"}`}
        >
          ERET
        </Link>

        {/* МЕНЮ */}
        <nav className="hidden md:flex gap-8 text-base font-medium">
          {[
            { href: "/", label: "Startseite" },
            { href: "/menu", label: "Speisekarte" },
            { href: "/about", label: "Über uns" },
            { href: "/lieferung", label: "Lieferung & Abholung" },
            { href: "/contact", label: "Kontakt" },
          ].map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group transition duration-300 ${
                  isActive
                    ? scrolled
                      ? "text-[#cc5c06]"
                      : "text-[#fce590]"
                    : scrolled
                    ? "text-black/80 hover:text-black"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {item.label}

                {/* underline */}
                <span
                  className={`absolute left-0 -bottom-1 h-[1px] transition-all duration-300 ${
                    isActive
                      ? `w-full ${
                          scrolled ? "bg-[#cc5c06]" : "bg-[#fce590]"
                        }`
                      : `w-0 group-hover:w-full ${
                          scrolled ? "bg-[#cc5c06]" : "bg-[#fce590]"
                        }`
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* 🛒 КОРЗИНА */}
          <button
  onClick={() => setCartOpen(true)}
  className="relative p-2 rounded-full hover:bg-black/5 transition hover:scale-110 active:scale-95"
>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-6 h-6 transition ${
                scrolled ? "text-black" : "text-white"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M16 21a1 1 0 100-2 1 1 0 000 2zm-8 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>

            {/* badge */}
            <span className="absolute -top-1 -right-1 bg-[#d4af37] text-white text-xs px-1.5 rounded-full">
              2
            </span>
          </button>

          {/* КНОПКА */}
          <Link
            href="/menu"
            className={`px-5 py-2 text-sm rounded-full transition duration-300 ${
              scrolled
                ? "border border-black/30 text-black hover:border-[#cc5c06] hover:text-[#cc5c06]"
                : "border border-white/30 text-white hover:border-[#fce590] hover:text-[#fce590]"
            } hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]`}
          >
            Online bestellen
          </Link>
        </div>
      </div>
      <CartDrawer open={cartOpen} setOpen={setCartOpen} />
    </header>
  );
}
