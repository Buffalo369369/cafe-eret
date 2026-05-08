"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";
import Link from "next/link";

export default function SuccessPage() {
  const clearCart = useCart((s) => s.clearCart);

  useEffect(() => {
  clearCart();
}, [clearCart]);

  return (
    <main className="bg-[#e9dfcf] min-h-screen flex items-center justify-center px-6 pt-[100px] pb-20">

      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center max-w-md w-full">

        {/* ICON */}
        <div className="text-5xl mb-4">🎉</div>

        {/* TITLE */}
        <h1 className="text-2xl md:text-3xl font-semibold text-[#2c2c2c] mb-3">
          Bestellung erfolgreich
        </h1>

        {/* TEXT */}
        <p className="text-[#5c4432] mb-6">
          Vielen Dank! Deine Bestellung ist bei uns eingegangen.
        </p>

        {/* BUTTON */}
        <Link href="/menu">
          <button className="
            px-6 py-3 rounded-full
            bg-gradient-to-r from-[#fff3a3] via-[#f4b740] to-[#cc5c06]
            text-black font-medium
            hover:scale-105 transition
          ">
            Weiter bestellen
          </button>
        </Link>

      </div>

    </main>
  );
}