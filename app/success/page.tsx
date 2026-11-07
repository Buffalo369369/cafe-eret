"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import Link from "next/link";
import {
  CASH_CONFIRMATION_STORAGE_KEY,
  GOOGLE_ADS_READY_EVENT,
  type PurchaseConversion,
  dispatchGoogleAdsPurchase,
  parsePurchaseConversion,
} from "@/lib/google-ads";

type Confirmation = "checking" | "cash" | "paid" | "unverified";

type VerificationResult = {
  confirmation: Confirmation;
  purchase: PurchaseConversion | null;
};

export default function SuccessPage() {
  const clearCart = useCart((s) => s.clearCart);
  const [confirmation, setConfirmation] = useState<Confirmation>("checking");
  const [purchase, setPurchase] = useState<PurchaseConversion | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function verify(): Promise<VerificationResult> {
      const sessionId = new URL(window.location.href).searchParams.get("session_id");
      if (sessionId) {
        const response = await fetch(`/api/verify?session_id=${encodeURIComponent(sessionId)}`, {
          signal: controller.signal,
        });
        const result = await response.json();
        const verifiedPurchase: PurchaseConversion | null =
          response.ok &&
          result.paid === true &&
          typeof result.totalCents === "number"
            ? parsePurchaseConversion(
                JSON.stringify({
                  transactionId: result.transactionId,
                  value: result.totalCents / 100,
                  currency: result.currency,
                })
              )
            : null;

        return {
          confirmation: response.ok && result.paid ? "paid" : "unverified",
          purchase: verifiedPurchase,
        };
      }

      try {
        const stored = sessionStorage.getItem(CASH_CONFIRMATION_STORAGE_KEY);
        if (!stored) return { confirmation: "unverified", purchase: null };

        // Legacy numeric confirmations continue to display success, but are not
        // eligible for tracking because they contain no authoritative value.
        const cashPurchase = parsePurchaseConversion(stored);
        return { confirmation: "cash", purchase: cashPurchase };
      } catch {
        return { confirmation: "unverified", purchase: null };
      }
    }

    verify()
      .then((result) => {
        if (controller.signal.aborted) return;
        setConfirmation(result.confirmation);
        setPurchase(result.purchase);
        if (result.confirmation === "paid") clearCart();
      })
      .catch(() => {
        if (!controller.signal.aborted) setConfirmation("unverified");
      });

    return () => controller.abort();
  }, [clearCart]);

  useEffect(() => {
    if (!purchase) return;

    const trySend = () => {
      if (!window.__eretGoogleAdsReady) return;
      dispatchGoogleAdsPurchase(purchase);
    };

    trySend();
    window.addEventListener(GOOGLE_ADS_READY_EVENT, trySend);
    return () => {
      window.removeEventListener(GOOGLE_ADS_READY_EVENT, trySend);
    };
  }, [purchase]);

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
