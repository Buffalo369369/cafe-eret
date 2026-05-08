import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Arimo } from "next/font/google";
import { Toaster } from "react-hot-toast";
import WhatsAppButton from "@/components/WhatsAppButton";
import CookieBanner from "@/components/CookieBanner";


const arimo = Arimo({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  metadataBase: new URL("https://eret-cafe.de"),

  title: "ERET Café Mülheim | Frühstück, Brunch & Lieferung",
  description:
    "Genieße frisches Frühstück, Croissants und Brunch in Mülheim an der Ruhr. Lieferung & Abholung verfügbar.",

  keywords: [
    "Café Mülheim",
    "Frühstück Mülheim",
    "Brunch Mülheim",
  ],

  alternates: {
    canonical: "https://eret-cafe.de",
  },

  openGraph: {
    title: "ERET Café",
    description: "Frühstück, Kaffee & Lieferung in Mülheim",
    url: "https://eret-cafe.de",
    siteName: "ERET Café",
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

        <WhatsAppButton />

        {/* 🔔 TOASTER ВНУТРИ */}
        <Toaster

  position="top-center"

  containerStyle={{

    zIndex: 99999,

  }}

/>
        
      <CookieBanner /> 
      </body>
    </html>
  );
}