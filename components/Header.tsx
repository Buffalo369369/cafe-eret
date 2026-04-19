"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/store/cart";
import Logo from "@/components/Logo";

export default function Header() {
    const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);
const count = useCart((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
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
        className={`relative w-full flex items-center justify-between px-4 md:px-8 transition-all duration-500 ${
          scrolled ? "py-3" : "py-4"
        }`}
      >
        {/* ЛОГО */}

<Link href="/" className= "ml-1 md:ml-0 hover:scale-[1.05] transition duration-300">
  <Logo scrolled={scrolled} />
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
        <div className="flex items-center gap-3 mr-1 md:mr-0">

          {/* 🛒 КОРЗИНА */}
          <button id="cart-icon"
  onClick={() => setCartOpen(true)}
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

          {/* КНОПКА */}
          <Link
            href="/menu"
            className={`px-3 py-1.5 text-xs md:px-5 md:py-2 md:text-sm rounded-full transition duration-300 ${
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
