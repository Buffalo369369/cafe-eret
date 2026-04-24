"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/store/cart";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  const count = useCart((s) =>
    s.items.reduce((sum, i) => sum + i.qty, 0)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[10000] bg-[#e9dfcf]/90 backdrop-blur-md shadow-[0_6px_30px_rgba(120,90,60,0.15)] border-b border-[#d6c7b2]">

        {/* CONTAINER */}
        <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between px-4 md:px-8 py-3">

          {/* LOGO */}
          <Link href="/" className="hover:scale-[1.05] transition">
            <Logo />
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
                      ? "text-[#cc5c06] font-semibold"
                      : "text-black/80 hover:text-black"
                  }`}
                >
                  {item.label}

                  <span
                    className={`absolute left-0 -bottom-1 h-[1px] transition-all duration-300 ${
                      isActive
                        ? "w-full bg-[#cc5c06]"
                        : "w-0 group-hover:w-full bg-[#cc5c06]"
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
                className="w-6 h-6 text-black"
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
                <span className="absolute -top-1 -right-1 bg-[#d4af37] text-white text-xs px-1.5 rounded-full">
                  {count}
                </span>
              )}
            </button>

            {/* 🍔 BURGER */}
            <button
              onClick={() => {
                setCartOpen(false);
                setMenuOpen((prev) => !prev);
              }}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 relative"
            >
              <span
                className={`absolute w-6 h-[2px] bg-black transition-all duration-300 ${
                  menuOpen ? "rotate-45" : "-translate-y-2"
                }`}
              />
              <span
                className={`absolute w-6 h-[2px] bg-black transition-all duration-300 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute w-6 h-[2px] bg-black transition-all duration-300 ${
                  menuOpen ? "-rotate-45" : "translate-y-2"
                }`}
              />
            </button>

          </div>
        </div>
      </header>

      {/* OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-[9998]"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="
              fixed top-[64px] left-0 w-full
              bg-gradient-to-b from-[#f4efe6] to-[#e9dfcf]
              border-b border-[#d6c7b2]
              shadow-md
              z-[9999]
            "
          >
            <div className="px-6 py-10 flex flex-col items-center gap-8 text-lg font-medium">

              {[
                { href: "/", label: "Startseite" },
                { href: "/menu", label: "Speisekarte" },
                { href: "/about", label: "Über uns" },
                { href: "/lieferung", label: "Lieferung" },
                { href: "/contact", label: "Kontakt" },
              ].map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`transition ${
                      isActive
                        ? "text-[#cc5c06] font-semibold"
                        : "text-[#2c2c2c]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART */}
      <CartDrawer open={cartOpen} setOpen={setCartOpen} />
    </>
  );
}