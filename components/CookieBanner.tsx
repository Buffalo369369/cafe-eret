"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  LEGACY_CONSENT_STORAGE_KEY,
  type ConsentChoice,
  readConsentChoice,
} from "@/lib/google-ads";

type View = "hidden" | "banner" | "preferences";

export default function CookieBanner() {
  const [view, setView] = useState<View>("hidden");
  const [advertising, setAdvertising] = useState(false);

  useEffect(() => {
    let stored: ConsentChoice | null = null;
    try {
      stored = readConsentChoice(window.localStorage);
    } catch {
      stored = null;
    }

    const frame = window.requestAnimationFrame(() => {
      if (stored) {
        setAdvertising(stored.advertising);
      } else {
        setView("banner");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const saveChoice = (allowAdvertising: boolean) => {
    const choice: ConsentChoice = { version: 2, advertising: allowAdvertising };
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
      window.localStorage.setItem(
        LEGACY_CONSENT_STORAGE_KEY,
        allowAdvertising ? "accepted" : "rejected"
      );
    } catch {
      // Consent still applies for this page even when persistent storage is blocked.
    }
    setAdvertising(allowAdvertising);
    setView("hidden");
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: choice }));
  };

  const openPreferences = () => {
    try {
      const stored = readConsentChoice(window.localStorage);
      if (stored) setAdvertising(stored.advertising);
    } catch { /* Keep the current in-memory selection. */ }
    setView("preferences");
  };

  const cancelPreferences = () => {
    try {
      const stored = readConsentChoice(window.localStorage);
      if (stored) setAdvertising(stored.advertising);
    } catch { /* Keep the current in-memory selection. */ }
    setView("hidden");
  };

  return (
    <>
      {view === "banner" && (
        <section
          className="fixed bottom-4 left-1/2 z-10001 w-[calc(100%-24px)] max-w-xl -translate-x-1/2 rounded-3xl border border-[#6b2c0d]/15 bg-[#fff3ce] p-5 text-[#5b210b] shadow-[0_18px_50px_rgba(89,35,9,0.24)] md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-banner-title"
        >
          <h2 id="cookie-banner-title" className="mb-2 text-lg font-bold">
            Datenschutz-Einstellungen
          </h2>
          <p className="mb-5 text-sm leading-relaxed">
            Notwendige Speicherungen halten Warenkorb und Bestellung funktionsfähig. Google Ads
            wird nur mit Ihrer ausdrücklichen Einwilligung geladen, um erfolgreiche Bestellungen
            zu messen. Als Bestelldaten senden wir keine Kontaktdaten an Google.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <button type="button" onClick={() => saveChoice(false)} className="min-h-11 rounded-full border border-[#5b210b]/25 px-5 text-sm font-semibold">
              Nur notwendige
            </button>
            <button type="button" onClick={openPreferences} className="min-h-11 rounded-full border border-[#5b210b]/25 px-5 text-sm font-semibold">
              Einstellungen
            </button>
            <button type="button" onClick={() => saveChoice(true)} className="min-h-11 rounded-full bg-[#5b210b] px-5 text-sm font-bold text-[#fff3ce]">
              Werbemessung akzeptieren
            </button>
          </div>
        </section>
      )}

      {view === "preferences" && (
        <section
          className="fixed bottom-4 left-1/2 z-10001 w-[calc(100%-24px)] max-w-xl -translate-x-1/2 rounded-3xl border border-[#6b2c0d]/15 bg-[#fff3ce] p-5 text-[#5b210b] shadow-[0_18px_50px_rgba(89,35,9,0.24)] md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
        >
          <h2 id="cookie-preferences-title" className="mb-4 text-lg font-bold">Cookie-Einstellungen</h2>
          <div className="mb-3 flex items-start justify-between gap-5 rounded-2xl bg-white/55 p-4">
            <div>
              <h3 className="font-bold">Notwendig</h3>
              <p className="mt-1 text-sm leading-relaxed">Warenkorb, Bestellablauf und Ihre Datenschutzauswahl. Immer aktiv.</p>
            </div>
            <span className="text-sm font-bold">Aktiv</span>
          </div>
          <label className="mb-5 flex cursor-pointer items-start justify-between gap-5 rounded-2xl bg-white/55 p-4">
            <span>
              <span className="block font-bold">Werbemessung</span>
              <span className="mt-1 block text-sm leading-relaxed">
                Misst angenommene Barbestellungen und bestätigte Kartenzahlungen für Google Ads.
                Als Bestelldaten werden nur Bestell-ID, Gesamtwert und Währung übertragen.
                Google kann zusätzlich technische Verbindungs- und Gerätedaten verarbeiten.
              </span>
            </span>
            <input
              type="checkbox"
              checked={advertising}
              onChange={(event) => setAdvertising(event.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-[#d75800]"
              aria-label="Werbemessung erlauben"
            />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={cancelPreferences} className="min-h-11 rounded-full border border-[#5b210b]/25 px-5 text-sm font-semibold">Abbrechen</button>
            <button type="button" onClick={() => saveChoice(advertising)} className="min-h-11 rounded-full bg-[#5b210b] px-5 text-sm font-bold text-[#fff3ce]">Auswahl speichern</button>
          </div>
        </section>
      )}

      {view === "hidden" && (
        <button
          type="button"
          onClick={openPreferences}
          className="fixed bottom-3 left-3 z-9990 rounded-full border border-[#5b210b]/20 bg-[#fff3ce] px-3 py-2 text-xs font-semibold text-[#5b210b] shadow-md"
          aria-label="Datenschutz-Einstellungen öffnen"
        >
          Cookie-Einstellungen
        </button>
      )}
    </>
  );
}
