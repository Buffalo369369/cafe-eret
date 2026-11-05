"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import Link from "next/link";

type Confirmation = "checking" | "cash" | "paid" | "unverified";

export default function SuccessPage() {
  const clearCart = useCart((s) => s.clearCart);
  const [confirmation, setConfirmation] = useState<Confirmation>("checking");

  useEffect(() => {
    const controller = new AbortController();
    async function verify(): Promise<Confirmation> {
      const sessionId = new URL(window.location.href).searchParams.get("session_id");
      if (sessionId) {
        const response = await fetch(`/api/verify?session_id=${encodeURIComponent(sessionId)}`, { signal: controller.signal });
        const result = await response.json();
        return response.ok && result.paid ? "paid" : "unverified";
      }
      try { return sessionStorage.getItem("eret-cash-confirmation") ? "cash" : "unverified"; }
      catch { return "unverified"; }
    }
    verify().then((result) => {
      if (controller.signal.aborted) return;
      setConfirmation(result);
      if (result === "paid") clearCart();
    }).catch(() => { if (!controller.signal.aborted) setConfirmation("unverified"); });
    return () => controller.abort();
  }, [clearCart]);

  const title = confirmation === "checking" ? "Bestätigung wird geprüft"
    : confirmation === "cash" ? "Bestellung erfolgreich"
    : confirmation === "paid" ? "Zahlung bestätigt" : "Keine Bestätigung verfügbar";
  const message = confirmation === "checking" ? "Einen Moment bitte."
    : confirmation === "cash" ? "Vielen Dank! Deine Bestellung ist bei uns eingegangen."
    : confirmation === "paid" ? "Vielen Dank! Deine Zahlung war erfolgreich. Die Bestellbestätigung erhältst du per E-Mail."
    : "Hier liegt keine bestätigte Bestellung vor. Prüfe bitte deine E-Mails oder kontaktiere uns, bevor du erneut bestellst.";

  return (
    <main className="pop-success min-h-screen flex items-center justify-center px-6 pt-[100px] pb-20">
      <div className="rounded-3xl p-8 md:p-12 text-center max-w-md w-full" role="status">
        <h1 className="text-2xl md:text-3xl font-semibold mb-3">{title}</h1>
        <p className="mb-6">{message}</p>
        <Link href="/menu" className="pop-button">Zur Speisekarte</Link>
        {confirmation === "unverified" && <Link href="/contact" className="block mt-5 underline">Kontakt aufnehmen</Link>}
      </div>
    </main>
  );
}
