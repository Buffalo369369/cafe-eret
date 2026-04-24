"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";
import { useEffect, useRef } from "react";

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

  const drawerRef = useRef<HTMLDivElement>(null);

  // 🔒 lock scroll + focus
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      drawerRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* OVERLAY */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* DRAWER */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            drag="y"
            dragConstraints={{ top: 0, bottom: 300 }}
dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 120) {
                setOpen(false);
              }
            }}
            className="
              fixed

              bottom-0 left-0 right-0
              h-[75vh]

              md:top-24 md:bottom-auto md:right-4 md:left-auto
              md:w-[360px] md:h-[80vh]

              rounded-t-2xl md:rounded-2xl
              bg-gradient-to-b from-[#f8f5ee] to-[#f1e7d8]
              text-[#2c2c2c]

              border border-black/5
              shadow-[0_20px_60px_rgba(0,0,0,0.25)]

              z-[9999]
              flex flex-col
              overflow-hidden
              outline-none
            "
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >

            {/* DRAG HANDLE */}
            <div className="w-12 h-1.5 bg-black/20 rounded-full mx-auto mt-2 mb-1 md:hidden" />

            {/* HEADER */}
            <div className="px-5 py-4 border-b border-black/10 flex justify-between items-center bg-white/60 backdrop-blur-md">
              <h2 className="text-lg md:text-xl font-semibold">
                Warenkorb 🛒
              </h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* ITEMS */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500">
                  Dein Warenkorb ist leer
                </p>
              ) : (
                <AnimatePresence>
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25 }}
                      className="flex justify-between items-center pb-4 border-b border-black/10"
                    >
                      {/* LEFT */}
                      <div>
                        <p className="font-semibold text-sm md:text-[15px]">
                          {item.name}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => decrease(item.id)}
                            className="w-7 h-7 rounded-full border active:scale-90 transition"
                          >
                            −
                          </button>

                          <span className="w-6 text-center text-sm">
                            {item.qty}
                          </span>

                          <button
                            onClick={() => increase(item.id)}
                            className="w-7 h-7 rounded-full border active:scale-90 transition"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="text-right">
                        <p className="font-semibold text-sm md:text-base">
                          {(item.price * item.qty).toFixed(2)} €
                        </p>

                        <button
                          onClick={() => remove(item.id)}
                          className="text-xs text-red-500 mt-1"
                        >
                          entfernen
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-5 border-t border-black/10 space-y-4 bg-white/50 backdrop-blur-sm">
              <div className="flex justify-between text-base md:text-lg font-semibold">
                <span>Gesamt</span>
                <span>{total.toFixed(2)} €</span>
              </div>

              <button
                className="
                  w-full py-3 rounded-full 
                  bg-gradient-to-r from-[#fff3a3] via-[#f4b740] to-[#cc5c06] 
                  text-black font-medium 
                  active:scale-95 transition
                "
              >
                Jetzt bestellen
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}