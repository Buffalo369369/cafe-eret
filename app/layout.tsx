import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Arimo } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Playfair_Display } from "next/font/google";
import WhatsAppButton from "@/components/WhatsAppButton";

const font = Playfair_Display({ subsets: ["latin"] });

const arimo = Arimo({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  metadataBase: new URL("https://eret-cafe.de"),

  title: "ERET Café Mülheim – Frühstück, Brunch & Lieferung",
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

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "ERET Café Mülheim",
    description:
      "Frühstück, Brunch und Lieferung in Mülheim an der Ruhr.",
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
          toastOptions={{
            style: {
              background: "#f8f5ee",
              color: "#2c2c2c",
              borderRadius: "12px",
              border: "1px solid #e0d6c3",
              padding: "12px 16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            },
          }}
        />
        
      </body>
    </html>
  );
}