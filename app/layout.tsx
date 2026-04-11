import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Arimo } from "next/font/google";
import { Toaster } from "react-hot-toast";

const arimo = Arimo({
  subsets: ["latin"],
  weight: ["400", "700"],
});

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