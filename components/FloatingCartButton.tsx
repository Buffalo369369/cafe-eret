"use client";

import { useCart } from "@/store/cart";

type Props = {
  onClick: () => void;
  open: boolean;
};

export default function FloatingCartButton({
  onClick,
  open,
}: Props) {
  const count = useCart((s) =>
    s.items.reduce((sum, i) => sum + i.qty, 0)
  );

  if (count === 0 || open) return null;

  return (
    <button
      onClick={onClick}
      aria-label="Warenkorb öffnen"
      className="
        md:hidden

        fixed bottom-6 right-6
        z-[9999]

        w-14 h-14
        rounded-full

        bg-[#f4eadb]/95

backdrop-blur-md

border border-[#d6c7b2]

        shadow-[0_10px_30px_rgba(0,0,0,0.25)]

        flex items-center justify-center

        active:scale-95
        transition
      "
    >
      <svg
  xmlns="http://www.w3.org/2000/svg"
  className="w-6 h-6 text-[#2c2c2c]"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.7}
    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M16 21a1 1 0 100-2 1 1 0 000 2zm-8 0a1 1 0 100-2 1 1 0 000 2z"
  />
</svg>

      <span
        className="
          absolute -top-1 -right-1

          min-w-[20px]
          h-5

          px-1

          rounded-full
          bg-[#2c2c2c]
          text-white

          text-[11px]
          font-medium

          flex items-center justify-center
        "
      >
        {count}
      </span>
    </button>
  );
}