"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -120]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    // ✅ ВАЛИДАЦИЯ
    if (!data.name || !data.email || !data.message) {
      toast.error("Bitte alle Felder ausfüllen");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      setLoading(false);

      if (res.ok) {
        toast.success("Nachricht gesendet!");
        form.reset();
      } else {
        toast.error("Fehler beim Senden");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Server Fehler");
    }
  };

  return (
    <main className="bg-[#e9dfcf]">

      {/* HERO */}
      <section className="relative h-[250px] md:h-[320px] flex items-center justify-center text-center overflow-hidden">

        {/* PARALLAX */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y }} className="w-full h-[120%]">
            <div
              className="w-full h-full bg-cover bg-[center_top] md:bg-[center_80%]"
              style={{ backgroundImage: "url('/contact.jpg')" }}
            />
          </motion.div>
        </div>

        {/* OVERLAY */}
<div className="absolute inset-0 bg-black/50" />

{/* TITLE */}
<motion.h1
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  className="
    relative z-10
    text-white text-3xl md:text-5xl font-semibold
    mt-15 md:mt-15
  "
>
  Kontakt
</motion.h1>

      </section>

      {/* CONTENT */}
      <section className="px-6 md:px-20 py-12 md:py-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

        {/* LEFT */}
        <div className="space-y-6">

          <h2 className="text-2xl md:text-4xl font-semibold text-[#2c2c2c]">
            Kontaktiere uns
          </h2>

          <div className="space-y-3 text-[#5c4432] text-base md:text-lg">

            <p>
              📍 Leineweberstr. 42-44 <br />
              45468 Mülheim an der Ruhr
            </p>

            <a
              href="tel:+4917659342961"
              className="block hover:text-[#b88a5a] transition"
            >
              📞 017659342961
            </a>

            <a
              href="https://wa.me/4917659342961"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-[#b88a5a] transition"
            >
              💬 WhatsApp schreiben
            </a>

            <p>
              ⏰ Di – So: 10:00 – 17:00
              <span className="block text-sm text-black/50">
                Montag: geschlossen
              </span>
            </p>

          </div>
        </div>

        {/* FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-md">

          <h3 className="text-lg font-semibold mb-4 text-[#2c2c2c]">
            Nachricht senden
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              name="name"
              type="text"
              placeholder="Name"
              className="w-full border border-black/10 rounded-lg px-4 py-2 outline-none"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full border border-black/10 rounded-lg px-4 py-2 outline-none"
            />

            <textarea
              name="message"
              placeholder="Nachricht"
              rows={4}
              className="w-full border border-black/10 rounded-lg px-4 py-2 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-full bg-[#2c2c2c] text-white hover:bg-black transition disabled:opacity-50"
            >
              {loading ? "Senden..." : "Senden"}
            </button>

          </form>

        </div>

      </section>

    </main>
  );
}