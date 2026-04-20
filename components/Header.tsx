"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/store/cart";
import Logo from "@/components/Logo";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();

  const count = useCart((s) =>
    s.items.reduce((sum, i) => sum + i.qty, 0)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-500 ${
        scrolled
          ? "bg-[#e9dfcf]/85 backdrop-blur-md shadow-[0_6px_30px_rgba(120,90,60,0.15)] border-b border-[#d6c7b2]"
          : "bg-gradient-to-b from-black/95 via-black/85 to-black/50 backdrop-blur-lg"
      }`}
    >
      {/* ✨ LIGHT */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(255,210,120,0.25),transparent_65%)]" />
      </div>

      {/* CONTENT */}
      <div className="relative w-full flex items-center justify-between px-4 md:px-8 py-3">

        {/* LOGO */}
        <Link href="/" className="hover:scale-[1.05] transition">
          <Logo scrolled={scrolled} />
        </Link>

        {/* DESKTOP MENU */}
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
                className={`relative group ${
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

                <span
                  className={`absolute left-0 -bottom-1 h-[1px] transition-all duration-300 ${
                    isActive
                      ? "w-full bg-[#cc5c06]"
                      : "w-0 group-hover:w-full bg-[#fce590]"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

        

          {/* 🛒 CART */}
          <button
            id="cart-icon"
            onClick={() => {
              setMenuOpen(false);
              setCartOpen(true);
            }}
            className="relative"
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

            {mounted && count > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#d4af37] text-white text-xs px-1.5 rounded-full animate-bounce">
                {count}
              </span>
            )}
          </button>

          {/* 🍔 BURGER */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden flex flex-col gap-1"
          >
            <span className={`w-6 h-[2px] ${scrolled ? "bg-black" : "bg-white"}`} />
            <span className={`w-6 h-[2px] ${scrolled ? "bg-black" : "bg-white"}`} />
            <span className={`w-6 h-[2px] ${scrolled ? "bg-black" : "bg-white"}`} />
          </button>


        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-[9999]">

          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/90"
            onClick={() => setMenuOpen(false)}
          />

          {/* content */}
          <div className="relative flex flex-col items-center justify-center h-full gap-8 text-white text-xl">

            <Link href="/" onClick={() => setMenuOpen(false)}>Startseite</Link>
            <Link href="/menu" onClick={() => setMenuOpen(false)}>Speisekarte</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}>Über uns</Link>
            <Link href="/lieferung" onClick={() => setMenuOpen(false)}>Lieferung</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>Kontakt</Link>

            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 text-2xl"
            >
              ✕
            </button>

          </div>
        </div>
      )}

      {/* CART */}
      <CartDrawer open={cartOpen} setOpen={setCartOpen} />

    </header>
  );
}