export default function Logo() {
  return (
    <div className="flex flex-col leading-tight">
      
      {/* ERET */}
      <span className="text-2xl font-light tracking-[0.35em] text-[#2c2c2c]">
        ERET
      </span>

      {/* Café */}
      <span className="text-[12px] tracking-[0.25em] mt-[2px] text-black/70">
        Café
      </span>

      {/* tagline */}
      <span className="text-[10px] tracking-[0.2em] mt-[2px] text-black/50">
        Mehr als Kaffee & Kuchen
      </span>

    </div>
  );
}