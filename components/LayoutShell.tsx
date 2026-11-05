"use client";

import { MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isQrMenu = pathname === "/speisekarte";

  return (
    <MotionConfig reducedMotion={pathname.startsWith("/admin") ? "never" : "user"}>
    <div className={pathname.startsWith("/admin") ? undefined : pathname === "/" ? "cafe-site reference-home" : `cafe-site reference-home brand-pages${isQrMenu ? " brand-qr" : ""}`}>
      {!isQrMenu && <Header />}

      {children}

      {!isQrMenu && <Footer />}
    </div>
    </MotionConfig>
  );
}
