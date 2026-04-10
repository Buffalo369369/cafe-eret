"use client";

import { motion, AnimatePresence } from "framer-motion";
type CartDrawerProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
};
export default function CartDrawer({ open, setOpen }: CartDrawerProps) {
  const items = [
    { name: "Avocado Frühstück", price: 9.9, qty: 1 },
    { name: "Hähnchen Sandwich", price: 7.5, qty: 2 },
  ];

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

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
  bg-[#f8f5ee] text-[#2c2c2c]
  border-l border-black/10
  shadow-[-20px_0_60px_rgba(0,0,0,0.35)] 
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
              {items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.qty} × {item.price.toFixed(2)} €
                    </p>
                  </div>
                  <p className="font-semibold">
                    {(item.price * item.qty).toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Gesamt</span>
                <span>{total.toFixed(2)} €</span>
              </div>

              <button className="w-full py-3 rounded-full bg-gradient-to-r from-[#fff3a3] via-[#f4b740] to-[#cc5c06] text-black font-medium hover:scale-105 transition">
                Jetzt bestellen
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}