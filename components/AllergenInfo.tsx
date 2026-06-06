"use client";

import { useState } from "react";
import { Info } from "lucide-react";

type Props = {

  list?: string[];

};

export default function AllergenInfo({ list }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
  onClick={() => setOpen(true)}
  className="
    w-5 h-5
    rounded-full
    bg-[#d8c3a5]
    text-white
    flex
    items-center
    justify-center
    hover:bg-[#c8aa7a]
    transition
  "
>
  <Info size={12}/>
</button>

      {open && (
        <div
          className="
          fixed inset-0
          bg-black/40
          flex items-center justify-center
          z-50
          px-6
          "
          onClick={() => setOpen(false)}
        >
          <div
            className="
           bg-[#f8f5ee]
rounded-[30px]
p-7
max-w-md
border border-[#e8dcc7]
shadow-2xl
            w-full
            shadow-xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-5">

             <div>

<h3 className="font-semibold text-xl text-[#5c4432]">
  Allergene
</h3>

<p className="text-sm text-[#7b6a58] mt-2">
Informationen zu Allergenen und Inhaltsstoffen.
</p>

</div>

              <button

  onClick={() => setOpen(false)}

  className="

  text-[#7b6a58]

  hover:text-black

  text-lg

  "

>

  ✕

</button>

            </div>

            <div className="flex flex-wrap gap-2">

              {list?.map((item) => (
                <div
  key={item}
  className="
    px-4 py-2
    rounded-full
    bg-white
    border border-[#e8dcc7]
    text-[#5c4432]
    text-sm
    shadow-sm
  "
>
                  {item}
                </div>
              ))}

            </div>

          </div>
        </div>
      )}
    </>
  );
}