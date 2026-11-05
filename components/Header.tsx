"use client";

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/store/cart";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import FloatingCartButton from "@/components/FloatingCartButton";

const subscribeToHydration = () => () => {};

export default function Header() {
  // Keep the persisted cart count out of the server-rendered header.
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  const count = useCart((s) =>
    s.items.reduce((sum, i) => sum + i.qty, 0)
  );

  useEffect(() => {

  document.body.style.overflow =

    menuOpen || cartOpen ? "hidden" : "";

  return () => {

    document.body.style.overflow = "";

  };

}, [menuOpen, cartOpen]);

  if (pathname === "/speisekarte") return null;

  return (
    <>
      <header className="cafe-header fixed z-[10000]">

        {/* CONTAINER */}
        <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between px-4 md:px-8 py-3">

          {/* LOGO */}
          <Link href="/" className="hover:scale-[1.05] transition">
            <Logo />
          </Link>

          {/* DESKTOP MENU */}
          <nav className="cafe-desktop-nav hidden md:flex gap-8 text-base font-medium">
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
                  aria-current={isActive ? "page" : undefined}
                  href={item.href}
                  className={`relative group ${
                    isActive
                      ? "text-[#cc5c06] font-semibold"
                      : "text-black/80 hover:text-black"
                  }`}
                >
                  {item.label}

                 {isActive && (
  <span
    className="
      absolute left-1/2 -bottom-2
      w-10 h-[2px]
      -translate-x-1/2

      bg-gradient-to-r
      from-[#fce590]
      via-[#f4b740]
      to-[#cc5c06]
    "
  />
)}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            {/* 🛒 CART */}
            <button

  id="cart-icon"

  aria-label="Warenkorb öffnen"
              onClick={() => {
                setMenuOpen(false);
                setCartOpen(true);
              }}
              className="cafe-cart-trigger relative"
            >
              <span className="pop-cart-label">Warenkorb</span>
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
  aria-expanded={menuOpen}
  aria-controls="mobile-navigation"
  aria-label={
    menuOpen ? "Menü schließen" : "Menü öffnen"
  }
              onClick={() => {
                setCartOpen(false);
                setMenuOpen((prev) => !prev);
              }}
              className="cafe-mobile-trigger md:hidden flex flex-col justify-center items-center w-8 h-8 relative"
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
            className="fixed inset-0 bg-black/20 z-[9999]"
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
            id="mobile-navigation"
            className="cafe-mobile-nav fixed z-[10000]"
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
  aria-current={isActive ? "page" : undefined}
  onClick={() => setMenuOpen(false)}
                  className={`cafe-mobile-nav-link relative transition ${
                    isActive
      ? "cafe-mobile-nav-link-active text-[#cc5c06] font-semibold"
      : "text-[#2c2c2c]"
  }`}
>
  {item.label}

  {isActive && (
    <span
      className="cafe-mobile-nav-wave"
      aria-hidden="true"
    />
  )}
</Link>
                );
              })}

            </div>
          </motion.div>
          
        )}
      </AnimatePresence>

            {/* CART */}

      <FloatingCartButton onClick={() => setCartOpen(true)}/>

      <CartDrawer

        open={cartOpen}

        setOpen={setCartOpen}

      />

    </>

  );

}
