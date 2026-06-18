import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Arimo } from "next/font/google";
import { Toaster } from "react-hot-toast";
import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/react";


const arimo = Arimo({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {

  metadataBase: new URL(
    "https://cafe-eret.de"
  ),

  title:
    "ERET Café Mülheim | Frühstück, Brunch & Lieferung",

  description:
    "Genieße frisches Frühstück, Croissants und Brunch in Mülheim an der Ruhr. Lieferung & Abholung verfügbar.",

  keywords: [
    "Café Mülheim",
    "Frühstück Mülheim",
    "Brunch Mülheim",
  ],

  alternates: {
    canonical:
      "https://cafe-eret.de",
  },

  openGraph: {

    title: "ERET Café",

    description:
      "Frühstück, Kaffee & Lieferung in Mülheim",

    url:
      "https://cafe-eret.de",

    siteName:
      "ERET Café",

    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
      },
    ],

    locale: "de_DE",

    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" data-scroll-behavior="smooth">
      <body className={arimo.className}>
        <Header />

        {children}

        <Footer />

        {/* 🔔 TOASTER ВНУТРИ */}
        <Toaster

  position="top-center"

  containerStyle={{

    zIndex: 99999,

  }}

/>
        
      <CookieBanner />

<Analytics />

</body>
</html>
  );
}