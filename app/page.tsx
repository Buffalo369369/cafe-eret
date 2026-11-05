"use client";

import { Coffee, Croissant, Soup, ArrowRight, Users, Heart, Utensils } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/store/cart";
import toast from "react-hot-toast";
import { menuData } from "@/store/menu";
import AllergenInfo from "@/components/AllergenInfo";

function flyToCart(e: React.MouseEvent<HTMLButtonElement>) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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

const displayPrice = (price: number) =>
  price.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

const featureCategories = [
  { title: "Frühstück & Brunch", description: "Herzhafte und süße Favoriten für einen guten Start in den Tag.", image: menuData[0].items[0].image, href: `/menu#${encodeURIComponent(menuData[0].title)}`, icon: Croissant },
  { title: "Für die Mittagspause", description: "Bunte Bowls und frische Zutaten – auch vegetarisch.", image: menuData[1].items[0].image, href: `/menu#${encodeURIComponent(menuData[1].title)}`, icon: Soup },
  { title: "Kaffee & Süßes", description: "Aromatischer Kaffee, gefüllte Croissants und süße Lieblingsstücke.", image: menuData[2].items[0].image, href: `/menu#${encodeURIComponent(menuData[2].title)}`, icon: Coffee },
];

const bestSellers = [menuData[2].items[1], menuData[0].items[3], menuData[6].items[7], menuData[1].items[0]];

export default function Home() {
  const addItem = useCart((s) => s.addItem);
  const increase = useCart((s) => s.increaseQty);
  const decrease = useCart((s) => s.decreaseQty);
  const items = useCart((s) => s.items);

  return (
    <main className="ref-main">
      <section className="ref-hero ref-width" aria-labelledby="hero-heading">
        <div className="ref-hero-copy">
          <h1 id="hero-heading">Dein Lieblingscafé<br />in Mülheim</h1>
          <p>Kaffee, Frühstück, knusprige Croissants und süße Lieblingsstücke – für deine kleine Auszeit im ERET Café.</p>
          <div className="ref-actions">
            <Link href="/menu" className="ref-button ref-button-cream"><Utensils size={21} />Speisekarte ansehen</Link>
            <Link href="/menu" className="ref-button ref-button-outline">Jetzt online bestellen <ArrowRight size={20} /></Link>
          </div>
        </div>
        <div className="ref-hero-food" aria-label="Kaffee, Croissant und Syrniki aus unserer Speisekarte">
          <div className="ref-food ref-coffee"><Image src={menuData[6].items[7].image} alt={menuData[6].items[7].name} fill preload sizes="(max-width: 767px) 45vw, 28vw" /></div>
          <div className="ref-food ref-sweet"><Image src={menuData[0].items[3].image} alt="Syrniki mit Sauerrahm und Konfitüre" fill sizes="(max-width: 767px) 42vw, 24vw" /></div>
          <div className="ref-food ref-croissant"><Image src={menuData[2].items[1].image} alt={menuData[2].items[1].name} fill sizes="(max-width: 767px) 60vw, 30vw" /></div>
        </div>
      </section>

      <section className="ref-categories ref-width" aria-label="Unsere Speisekarte entdecken">
        {featureCategories.map(({ title, description, image, href, icon: Icon }) => (
          <Link key={title} href={href} className="ref-category">
            <div className="ref-category-photo"><Image src={image} alt="" fill sizes="(max-width: 767px) 35vw, 15vw" /></div>
            <div className="ref-category-copy"><Icon aria-hidden="true" size={31} /><h2>{title}</h2><p>{description}</p><span className="ref-category-arrow" aria-hidden="true"><ArrowRight size={20} /></span></div>
          </Link>
        ))}
      </section>

      <section className="ref-bestsellers ref-panel ref-width" aria-labelledby="bestsellers-heading">
        <div className="ref-section-heading"><h2 id="bestsellers-heading">Unsere Bestseller</h2><Link href="/menu">Alle Highlights entdecken <ArrowRight size={20} /></Link></div>
        <div className="ref-product-grid">
          {bestSellers.map((item) => {
            const current = items.find((x) => x.id === item.id);
            return (
              <article
                key={item.id}
                className="ref-product"
              >
                <div className="ref-product-media">
                  <Image src={item.image} alt={item.name} fill sizes="(max-width: 1100px) 45vw, 23vw" />
                </div>

                <div className="ref-product-info">
                  <div className="ref-product-topline">
                    <div className="ref-product-name">
                      <h3>{item.name}</h3>
                      <AllergenInfo allergens={item.allergens} additives={item.additives} />
                    </div>
                    <span className="ref-product-price">{displayPrice(item.price)}</span>
                  </div>
                  <p>{item.desc || (item.id === menuData[6].items[7].id ? "Deine kleine Kaffeepause mit cremigem Milchschaum." : "")}</p>

                  {!current ? (
                    <button
                      onClick={(e) => {
                        flyToCart(e);
                        addItem({ id: item.id, name: item.name, price: item.price });
                        toast.success("Hinzugefügt 🛒");
                      }}
                      className="ref-product-button"
                    >
                      In den Warenkorb
                    </button>
                  ) : (
                    <div className="ref-qty-row">
                      <button aria-label={`${item.name}: Menge verringern`} onClick={() => decrease(item.id)}>
                        −
                      </button>
                      <span>{current.qty}</span>
                      <button aria-label={`${item.name}: Menge erhöhen`} onClick={() => increase(item.id)}>
                        +
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ref-lunch ref-panel ref-width">
        <div className="ref-lunch-copy"><p className="ref-kicker"><Soup size={25} />Für deine Mittagspause</p><h2>Leckere Bowls.<br />Frisch auf den Tisch.</h2><p>Entdecke unsere Bowls und Sandwiches aus der regulären Speisekarte.</p></div>
        <div className="ref-lunch-image"><Image src={menuData[1].items[0].image} alt={menuData[1].items[0].name} fill sizes="(max-width: 767px) 55vw, 28vw" /></div>
        <Link href={`/menu#${encodeURIComponent(menuData[1].title)}`} className="ref-button ref-button-brown">Bowls entdecken <ArrowRight size={22} /></Link>
      </section>

      <section className="ref-about ref-panel ref-width">
        <div className="ref-about-image"><Image src="/contact.jpg" alt="Gemütlicher Sitzplatz im ERET Café" fill sizes="(max-width: 767px) 100vw, 42vw" /></div>
        <div className="ref-about-copy"><h2>Mehr als nur ein Café</h2><p>Ein Ort für gemeinsame Zeit – mit der Familie, mit Freunden oder einfach für dich. Komm vorbei und mach es dir bei uns gemütlich.</p><div className="ref-about-highlights"><span><Users />Familienzeit</span><span><Coffee />Freunde treffen</span><Link href="/about"><Heart />ERET kennenlernen</Link></div></div>
      </section>
    </main>
  );
}
