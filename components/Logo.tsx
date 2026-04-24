export default function Logo() {
  return (
    <div className="flex flex-col leading-none select-none">

      {/* ERET */}
      <span className="
        text-xl md:text-2xl
        font-medium
        tracking-[0.28em]
        text-[#2c2c2c]
      ">
        ERET
      </span>

      {/* Café */}
      <span className="
        text-[11px] md:text-xs
        tracking-[0.22em]
        text-[#5c4432]
        mt-[2px]
      ">
        CAFÉ
      </span>

      {/* tagline */}
      <span className="
        hidden md:block
        text-[10px]
        tracking-[0.18em]
        text-[#8a735c]
        mt-[2px]
      ">
        Mehr als Kaffee & Kuchen
      </span>

    </div>
  );
}