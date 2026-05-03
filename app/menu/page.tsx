"use client";

import { motion } from "framer-motion";
import { useCart } from "@/store/cart";
import toast from "react-hot-toast";
import { menuData } from "@/store/menu";
import { useState } from "react";

function flyToCart(e: React.MouseEvent<HTMLButtonElement>) {
  const button = e.currentTarget;
  const cart = document.getElementById("cart-icon");

  if (!cart) return;

  const rect = button.getBoundingClientRect();
  const cartRect = cart.getBoundingClientRect();

  const clone = button.cloneNode(true) as HTMLElement;

  clone.style.position = "fixed";
  clone.style.left = rect.left + "px";
  clone.style.top = rect.top + "px";
  clone.style.width = rect.width + "px";
  clone.style.zIndex = "9999";
  clone.style.transition = "all 0.7s cubic-bezier(.65,-0.3,.3,1.5)";
  clone.style.pointerEvents = "none";

  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.left = cartRect.left + "px";
    clone.style.top = cartRect.top + "px";
    clone.style.transform = "scale(0.3)";
    clone.style.opacity = "0.3";
  });

  setTimeout(() => clone.remove(), 700);
}

export default function MenuPage() {
  const addItem = useCart((s) => s.addItem);
  const increase = useCart((s) => s.increaseQty);
  const decrease = useCart((s) => s.decreaseQty);
  const items = useCart((s) => s.items);

  // ✅ ВОТ ЧЕГО НЕ ХВАТАЛО
  const [active, setActive] = useState(menuData[0]?.title);

  return (
    <main className="pt-[70px] md:pt-[90px]">

      {/* HEADER */}
      <section className="relative py-6 md:py-10 px-6 md:px-20 text-center overflow-hidden bg-[#e9dfcf]">

  {/* фон */}
  <div
    className="
      absolute inset-0
      bg-[url('/paper.jpg')]
      bg-cover
      bg-center
      opacity-30
    "
  />

  <div className="absolute inset-0 bg-[#e9dfcf]/80" />

  {/* текст */}
  <div className="relative z-10">
    <h1 className="text-3xl md:text-6xl font-semibold text-[#2c2c2c]">
      Speisekarte
    </h1>
  </div>

</section>

      {/* STICKY CATEGORY BAR */}
      <div className="sticky top-[70px] md:top-[80px] z-30 bg-[#e9dfcf]/95 backdrop-blur-md border-b border-black/5">
  <div className="flex gap-3 overflow-x-auto px-6 py-3 no-scrollbar">

    {menuData.map((section) => (
      <button
        key={section.title}
        onClick={() => {
  setActive(section.title);

  const el = document.getElementById(section.title);
  if (!el) return;

  const headerHeight =
    document.querySelector("header")?.clientHeight || 0;

  const y =
    el.getBoundingClientRect().top +
    window.scrollY -
    headerHeight -
    80; // ← воздух сверху

  window.scrollTo({ top: y, behavior: "smooth" });
}}
        className={`
          whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition
          ${
            active === section.title
              ? "bg-[#2c2c2c] text-white shadow-md"
              : "bg-white/70 text-[#5c4432] hover:bg-white"
          }
        `}
      >
        {section.title}
      </button>
    ))}

  </div>
</div>

     

      {/* MENU */}
     <section className="relative px-6 md:px-20 py-10 md:py-16 bg-[#e9dfcf]">

  <div
    className="
      absolute inset-0
      bg-[url('/paper.jpg')]
      bg-cover
      bg-center
      opacity-20
      pointer-events-none
    "
  />

  <div className="relative z-10 max-w-6xl mx-auto space-y-14">
            

          {menuData.map((section) => (
            <div
  key={section.title}
  id={section.title}
  className="scroll-mt-[90px] md:scroll-mt-[110px]"
>

              <h2 className="text-2xl md:text-4xl font-semibold text-[#5c4432] mb-6">
                {section.title}
              </h2>

              <div className="grid md:grid-cols-3 gap-6">

                {section.items.map((item) => {
                  const current = items.find((x) => x.id === item.id);

                  return (
                    <motion.div
  key={item.id}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-50px" }}
  variants={{
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  }}
  transition={{ duration: 0.4 }}
>
                      <img
  src={item.image}
  alt={item.name}
  className="h-48 w-full object-cover"
/>

                      <div className="p-4">

                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-semibold text-[#2c2c2c] text-sm md:text-base">
                            {item.name}
                          </h3>

                          <span className="text-[#b88a5a] font-bold text-sm">
                            {item.price} €
                          </span>
                        </div>

                        <p className="text-xs text-black/60 mt-1">
                          {item.desc}
                        </p>

                        <div className="mt-4">

                          {!current ? (
                            <button
                              onClick={(e) => {
                                flyToCart(e);
                                addItem({
                                  id: item.id,
                                  name: item.name,
                                  price: item.price,
                                });
                                toast.success("Hinzugefügt 🛒");
                              }}
                              className="w-full py-2 rounded-full bg-[#2c2c2c] text-white text-sm hover:bg-black active:scale-[0.97] transition"
                            >
                              In den Warenkorb
                            </button>
                          ) : (
                            <div className="flex items-center justify-between">

                              <button
                                onClick={() => decrease(item.id)}
                                className="w-8 h-8 rounded-full border"
                              >
                                −
                              </button>

                              <span className="font-medium">
                                {current.qty}
                              </span>

                              <button
                                onClick={() => increase(item.id)}
                                className="w-8 h-8 rounded-full border"
                              >
                                +
                              </button>

                            </div>
                          )}

                        </div>

                      </div>
                    </motion.div>
                  );
                })}

              </div>

            </div>
          ))}

        </div>
      </section>

    </main>
  );
}