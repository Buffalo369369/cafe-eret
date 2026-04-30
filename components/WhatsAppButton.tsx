"use client";

import { motion } from "framer-motion";

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/4917659342961"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1 }}
      className="
        fixed bottom-5 right-5 z-[9999]

        w-14 h-14
        rounded-full

        flex items-center justify-center

        bg-[#25D366]
        text-white

        shadow-[0_8px_25px_rgba(0,0,0,0.25)]
        hover:scale-110 active:scale-95

        transition
      "
    >
      <img src="/whatsapp.svg" className="w-6 h-6" />
    </motion.a>
  );
}