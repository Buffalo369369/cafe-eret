export default function Logo({ scrolled }: { scrolled: boolean }) {
  return (
    <div className="flex flex-col leading-tight">
      
      {/* ERET (БОЛЬШЕ И СИЛЬНЕЕ) */}
      <span
        className={`text-2xl font-light tracking-[0.35em] ${
          scrolled ? "text-black" : "text-white"
        }`}
      >
        ERET
      </span>

      {/* Café */}
      <span
        className={`text-[12px] tracking-[0.25em] mt-[2px] ${
          scrolled ? "text-black/80" : "text-white/80"
        }`}
      >
        Café
      </span>

      {/* tagline */}
      <span
        className={`text-[10px] tracking-[0.2em] mt-[2px] ${
          scrolled ? "text-black/50" : "text-white/50"
        }`}
      >
        Mehr als Kaffee & Kuchen
      </span>
    </div>
  );
}