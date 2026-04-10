import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Arimo } from "next/font/google";

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
      </body>
    </html>
  );
}

const arimo = Arimo({
  subsets: ["latin"],
  weight: ["400", "700"],
});