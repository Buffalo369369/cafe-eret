"use client";

import { useCart } from "@/store/cart";
import { usePathname } from "next/navigation";

type Props = {
  onClick: () => void;
};

export default function FloatingCartButton({
  onClick,
}: Props) {

  const pathname = usePathname();

if (pathname === "/speisekarte") {
  return null;
}
const count = useCart((s) =>
    s.items.reduce((sum, i) => sum + i.qty, 0)
  );

  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-5 right-5
        z-[9999]

        w-14 h-14
        rounded-full

        bg-[#f4b740]
        shadow-xl

        flex items-center
        justify-center

        active:scale-95
        transition
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-black"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.7}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M16 21a1 1 0 100-2 1 1 0 000 2zm-8 0a1 1 0 100-2 1 1 0 000 2z"
        />
      </svg>

      <span
        className="
          absolute -top-1 -right-1
          bg-black text-white
          text-xs rounded-full
          px-1.5 py-0.5
        "
      >
        {count}
      </span>
    </button>
  );
}