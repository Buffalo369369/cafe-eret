"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const rejectAll = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="
      fixed bottom-6 left-1/2 -translate-x-1/2
      w-[90%] md:w-[500px]
      bg-white/90 backdrop-blur-md
      border border-[#e0d6c3]
      rounded-2xl shadow-xl
      p-5 z-[9999]
    ">
      <p className="text-sm text-[#2c2c2c] mb-4 leading-relaxed">
        Wir verwenden Cookies, um unsere Website zu verbessern und Ihnen die
        bestmögliche Erfahrung zu bieten.
      </p>

      <div className="flex gap-3 justify-end">

        <button
          onClick={rejectAll}
          className="px-4 py-2 text-sm rounded-full border border-[#2c2c2c]/20 hover:bg-black/5 transition"
        >
          Ablehnen
        </button>

        <button
          onClick={acceptAll}
          className="px-4 py-2 text-sm rounded-full bg-[#2c2c2c] text-white hover:bg-black transition"
        >
          Akzeptieren
        </button>

      </div>
    </div>
  );
}