"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/store/cart";
import toast from "react-hot-toast";

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

  setTimeout(() => {
    clone.remove();
  }, 700);
}

const menu = [
  { name: "Croissant mit Lachs", price: "9 €", image: "/food1.jpg" },
  { name: "Caesar-Salat mit Hähnchen", price: "11,5 €", image: "/food2.jpg" },
  { name: "Ciabatta mit Hähnchen", price: "8 €", image: "/food3.jpg" },
];

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -250]);
  const addItem = useCart((s) => s.addItem);

  return (
    <main>

      {/* HERO */}
      <section
  className="
    relative min-h-[50vh] md:min-h-[80vh]
    flex items-start pt-32 md:pt-0 md:items-center
    px-6 md:px-20
  "
>
        <div className="relative z-10 max-w-2xl text-white "></div>
        <div className="relative z-10 max-w-2xl text-white space-y-2"></div>
        

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div style={{ y }} className="w-full h-[120%]">
  <div
    className="
      w-full h-full
      bg-cover

      bg-[url('/hero-mobile.jpg')]
      bg-[center_0%]

      md:bg-[url('/hero-desktop.jpg')]
      md:bg-[center_90%]
    "
  />
</motion.div>
        </div>

        <div className="absolute inset-0 bg-black/55 pointer-events-none" />

        <div className="relative z-10 max-w-2xl text-white">

          {/* TITLE */}
          <motion.h1
  initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
  transition={{ duration: 1 }}
  className="text-4xl md:text-7xl font-semibold leading-[1.15] tracking-tight mb-6 pb-1"
>
            <span className="block bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              Lieferung
            </span>
            <span className="block bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              in Mülheim
            </span>
            <span className="block text-xl md:text-3xl font-light text-white/80 mt-3">
              Frühstück & Brunch
            </span>
          </motion.h1>

          {/* LINE */}
          <div className="max-w-md h-[2px] opacity-80 bg-gradient-to-r from-transparent via-[#fce590] to-transparent mb-6" />

          <div className="flex gap-3 mt-6 flex-wrap">

  {/* PRIMARY */}
  <Link href="/menu">
    <button className="
      px-5 py-2.5
      rounded-full
      text-sm font-medium
      bg-gradient-to-r from-[#fce590] via-[#f4b740] to-[#cc5c06]
      text-[#2c2c2c]
      shadow-[0_8px_20px_rgba(204,92,6,0.25)]
      hover:scale-[1.05]
      transition
    ">
      Jetzt bestellen
    </button>
  </Link>

  {/* SECONDARY */}
  <Link href="/menu">
    <button className="
      px-5 py-2.5
      rounded-full
      text-sm font-medium
      bg-white/5
      text-white
      border border-white/15
      backdrop-blur-md
      hover:bg-white/10
      transition
    ">
      Speisekarte
    </button>
  </Link>

</div>

          {/* CONTACT */}
          <div className="mt-6 text-sm md:text-base text-white/80 space-y-2">
          
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span className="break-words">
                Leineweberstr. 42-44, 45468 Mülheim an der Ruhr
              </span>
            </div>

            <a
              href="tel:+4917659342961"
              className="flex items-center gap-2 text-white/90 hover:text-[#fce590]"
            >
              <span>📞</span>
              <span>017659342961</span>
            </a>
          </div>

        </div>

        {/* переход */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-2 
        bg-gradient-to-b from-transparent via-[#fce590]/20 to-[#e9dfcf]" />

      </section>

    
        

  

      {/* СПЕЦИАЛЬНОСТИ */}
      <section
  className="relative py-8 md:py-14 px-6 md:px-20 text-center bg-cover bg-center"
  style={{ backgroundImage: "url('/paper.jpg')" }}
>
  <h2 className="text-2xl md:text-5xl font-semibold text-[#5c4432] leading-tight mb-6 md:mb-10">
    Unsere <br className="md:hidden" /> Spezialitäten
  </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {menu.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden bg-white shadow-md"
            >
              <div
                className="h-56 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              />

              <div className="p-5 bg-white">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-[#2c2c2c]">
  {item.name}
</h3>

<span className="block font-bold text-[#b88a5a] mt-1">
  {item.price}
</span>
                </div>

                <button
                  onClick={(e) => {
                    flyToCart(e);
                    addItem({
                      name: item.name,
                      price: parseFloat(item.price.replace(",", ".")),
                    });
                    toast.success("Hinzugefügt 🛒");
                  }}
                  className="mt-4 w-full py-2 rounded-full bg-[#2c2c2c] text-white text-sm hover:bg-black transition"
                >
                  In den Warenkorb
                </button>
              </div>
            </motion.div>
          ))}

        </div>
      </section>

      {/* ДОСТАВКА */}
      <section className="relative py-20 px-6 md:px-20 text-white overflow-hidden">

  {/* PARALLAX */}
  <motion.div style={{ y }} className="absolute inset-0 h-[250%] top-[-15%]">
    <div
      className="w-full h-full bg-cover bg-[center_30%] md:bg-center"
      style={{ backgroundImage: "url('/delivery.jpg')" }}
    />
  </motion.div>

  {/* OVERLAY */}
  <div className="absolute inset-0 bg-black/60" />

  {/* CONTENT */}
  <div className="relative z-10 max-w-5xl mx-auto">

    <div className="bg-black/40 backdrop-blur-md p-6 md:p-10 rounded-2xl max-w-xl">

      <h2 className="text-3xl md:text-4xl font-semibold mb-4">
        Lieferung in Mülheim
      </h2>

      <p className="mb-2">🚀 Schnelle Lieferung in ganz Mülheim</p>
      <p>💸 Kostenlose Lieferung ab 30 €</p>

    </div>

  </div>
</section>

    </main>
  );
}