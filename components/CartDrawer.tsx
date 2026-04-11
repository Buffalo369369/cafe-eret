"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";

type CartDrawerProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

export default function CartDrawer({ open, setOpen }: CartDrawerProps) {
  const items = useCart((s) => s.items);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const increase = useCart((s) => s.increaseQty);
  const decrease = useCart((s) => s.decreaseQty);
  const remove = useCart((s) => s.removeItem);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* OVERLAY */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* DRAWER */}
          <motion.div
            className="fixed right-0 top-0 h-screen w-[420px] 
            bg-gradient-to-b from-[#f8f5ee] to-[#f1e7d8]
            text-[#2c2c2c]
            border-l border-black/10
            shadow-[-30px_0_80px_rgba(0,0,0,0.45)]
            z-[10000] flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >

            {/* HEADER */}
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Warenkorb</h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* ITEMS */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500">Dein Warenkorb ist leer</p>
              ) : (
                items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center pb-4 border-b border-black/10"
                  >
                    {/* LEFT */}
                    <div>
                      <p className="font-semibold text-[15px]">
                        {item.name}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => decrease(item.name)}
                          className="w-7 h-7 rounded-full border border-black/20 flex items-center justify-center hover:bg-black/5"
                        >
                          −
                        </button>

                        <span className="w-6 text-center">
                          {item.qty}
                        </span>

                        <button
                          onClick={() => increase(item.name)}
                          className="w-7 h-7 rounded-full border border-black/20 flex items-center justify-center hover:bg-black/5"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="text-right">
                      <p className="font-semibold">
                        {(item.price * item.qty).toFixed(2)} €
                      </p>

                      <button
                        onClick={() => remove(item.name)}
                        className="text-xs text-red-500 hover:underline mt-1"
                      >
                        entfernen
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t border-black/10 space-y-4 bg-[#f8f5ee]">
              <div className="flex justify-between text-lg font-semibold">
                <span>Gesamt</span>
                <span>{total.toFixed(2)} €</span>
              </div>

              <button className="w-full py-3 rounded-full 
              bg-gradient-to-r from-[#fff3a3] via-[#f4b740] to-[#cc5c06] 
              text-black font-medium 
              hover:scale-105 transition">
                Jetzt bestellen
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}