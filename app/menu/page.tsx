"use client";

import { motion } from "framer-motion";
import { useCart } from "@/store/cart";
import toast from "react-hot-toast";
import { menuData } from "@/store/menu";
import { useEffect, useRef, useState } from "react";
import AllergenInfo from "@/components/AllergenInfo";

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

  const categoryRefs = useRef<
  Record<string, HTMLButtonElement | null>
>({});

  useEffect(() => {
  const handleScroll = () => {
    const offset = 180; // высота header + панели категорий

    let current = menuData[0].title;

    for (const section of menuData) {
      const el = document.getElementById(section.title);

      if (!el) continue;

      const top = el.getBoundingClientRect().top;

      if (top <= offset) {
        current = section.title;
      } else {
        break;
      }
    }

    setActive(current);
  };

  window.addEventListener("scroll", handleScroll);

  // сразу определить активную секцию
  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

useEffect(() => {
  const button = categoryRefs.current[active];

  if (!button) return;

  button.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest",
  });
}, [active]);

  const [selectedExtras, setSelectedExtras] = useState<
Record<string, string[]>
>({});

const [selectedOptions, setSelectedOptions] = useState<

  Record<string, Record<string, string>>

>({});

  return (
    <main>

      {/* HEADER */}
<section className="relative pt-[110px] pb-10 md:pt-[110px] md:pb-16 px-6 md:px-20 text-center overflow-hidden">

  {/* PAPER BACKGROUND */}
  <div
    className="
      absolute inset-0
      bg-[url('/paper2.jpg')]
      bg-cover
      bg-center
      opacity-60
    "
  />

  {/* SOFT OVERLAY */}
  <div className="absolute inset-0 bg-[#e9dfcf]/40" />

  {/* CONTENT */}
  <div className="relative z-10">
    <h1 className="text-3xl md:text-6xl font-semibold text-[#2c2c2c]">
      Speisekarte
    </h1>
  </div>

</section>

      {/* STICKY CATEGORY BAR */}
      <div className="sticky top-[70px] md:top-[80px] z-30 bg-[#e9dfcf]/95 backdrop-blur-md border-b border-black/5">
  <div
  className="
    flex
    gap-3
    overflow-x-auto
    px-6
    py-3
    no-scrollbar
    snap-x
    snap-mandatory
    scroll-smooth
  "
>

    {menuData.map((section) => (
      <button
        ref={(el) => {
        categoryRefs.current[section.title] = el;
        }}
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
          snap-center whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition
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
     <section className="relative px-6 md:px-20 py-10 md:py-16">

  <div
    className="
      absolute inset-0
      bg-[url('/paper.jpg')]
      bg-cover
      bg-center
      opacity-40
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
                  const chosenExtras =
  item.extras?.filter((extra) =>
    selectedExtras[item.id]?.includes(extra.id)
  ) || [];

const selectedMilk =
  item.options?.[0]?.values.find(
    (option) =>
      option.id ===
      (
        selectedOptions[item.id]?.["🥛 Milch auswählen"] ??
        "normal"
      )
  );

const milkId = selectedMilk?.id || "normal";

const cartId =
  item.id +
  "-" +
  milkId +
  "-" +
  chosenExtras.map((e) => e.id).join("-");

const current =
  items.find((x) => x.id === cartId);
                  const extrasPrice =
  item.extras
    ?.filter((extra) =>
      selectedExtras[item.id]?.includes(extra.id)
    )
    .reduce((sum, extra) => sum + extra.price, 0) || 0;

const totalPrice = item.price + extrasPrice;
                  

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
  className="
    bg-white/80
    backdrop-blur-md
    rounded-3xl
    overflow-hidden
    shadow-lg
  "
>
                      <img
  decoding="async"
  src={item.image}
  alt={`${item.name} – Frühstück im ERET Café Mülheim`}
  loading="lazy"
  className="h-48 w-full object-cover"
/>

                      <div className="p-4">

                        <div className="flex justify-between items-start gap-2">

  <div className="flex items-center gap-2">

    <h3 className="font-semibold text-[#2c2c2c] text-sm md:text-base">
      {item.name}
    </h3>

   <AllergenInfo

  allergens={item.allergens}

  additives={item.additives}

/>

  </div>

  <span className="text-[#b88a5a] font-bold text-sm">
    {totalPrice.toFixed(2)} €
  </span>

</div>

                        <p className="text-xs text-black/60 mt-1">
                          {item.desc}
                        </p>

                        {item.extras?.length > 0 && (
  <div className="mt-3">

    <p className="mb-2 text-xs text-[#5c4432]/70">
      Optional hinzufügen
    </p>

    <div className="flex flex-wrap gap-2">

      {item.extras.map((extra) => {
        const checked =
          selectedExtras[item.id]?.includes(extra.id) || false;

        return (
          <button
            key={extra.id}
            type="button"
            onClick={() =>
              setSelectedExtras((prev) => ({
                ...prev,
                [item.id]: checked
                  ? (prev[item.id] || []).filter(
                      (x) => x !== extra.id
                    )
                  : [...(prev[item.id] || []), extra.id],
              }))
            }
            className={`
              px-3 py-2
              rounded-full
              text-xs
              border
              transition
              ${
                checked
                  ? "bg-[#2c2c2c] text-white border-[#2c2c2c]"
                  : "bg-[#f8f5ee] text-[#5c4432] border-[#e8dcc7]"
              }
            `}
          >
            {extra.name} (+{extra.price} €)
          </button>
        );
      })}

    </div>

  </div>
)}

{item.options?.map((group) => (

  <div
    key={group.title}
    className="mt-4"
  >

    <p className="text-xs text-[#5c4432]/70 mb-2">
      {group.title}
    </p>

    <div className="flex flex-wrap gap-2">

      {group.values.map((option) => {

        const selected =
          (
            selectedOptions[item.id]?.[group.title] ??
            "normal"
          ) === option.id;

        return (

          <button
            key={option.id}
            type="button"

            onClick={() =>
              setSelectedOptions((prev) => ({
                ...prev,
                [item.id]: {
                  ...prev[item.id],
                  [group.title]: option.id,
                },
              }))
            }

           className={`

  px-2.5

  py-1.5

  rounded-full

  text-[11px]

  font-medium

  border

  transition

  ${

    selected

      ? "bg-[#2c2c2c] text-white border-[#2c2c2c]"

      : "bg-[#f8f5ee] text-[#5c4432] border-[#e8dcc7]"

  }

`}
          >
            {option.name}
          </button>

        );

      })}

    </div>

  </div>

))}

                        <div className="mt-4">

                          {!current ? (
                            <button
                              onClick={(e) => {
                                flyToCart(e);
                                

addItem({
  id: cartId,

  name:

  item.name +

  (selectedMilk

    ? ` (${selectedMilk.name})`

    : "") +

  (

    chosenExtras.length

      ? " + " +

        chosenExtras

          .map((e) => e.name)

          .join(", ")

      : ""

  ),

  price: totalPrice,
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
                               onClick={() => decrease(cartId)}
                                className="w-8 h-8 rounded-full border"
                              >
                                −
                              </button>

                              <span className="font-medium">
                                {current.qty}
                              </span>

                              <button
                              onClick={() => increase(cartId)}
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