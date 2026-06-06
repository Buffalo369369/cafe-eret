"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { createPortal } from "react-dom";

type Props = {
  allergens?: string[];
  additives?: string[];
};

export default function AllergenInfo({
  allergens = [],
  additives = [],
}: Props) {
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
        <Info size={12} />
      </button>

      {open &&
        createPortal(
          <div
            className="
              fixed inset-0
              bg-black/40
              flex items-center justify-center
              z-[9999]
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
                w-full
                border border-[#e8dcc7]
                shadow-2xl
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-[#5c4432]">
                    Informationen
                  </h3>

                  <p className="text-sm text-[#7b6a58] mt-2">
                    Allergene und Zusatzstoffe dieses Produkts.
                  </p>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="
                    text-[#7b6a58]
                    hover:text-black
                    text-xl
                    transition
                  "
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* ALLERGENE */}
                {allergens.length > 0 && (
                  <div>
                    <h4 className="font-medium text-lg text-[#5c4432] mb-3">
                      Allergene
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {allergens.map((item) => (
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
                )}

                {/* ADDITIVES */}
                {additives.length > 0 && (
                  <div>
                    <h4 className="font-medium text-lg text-[#5c4432] mb-3">
                      Zusatzstoffe
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {additives.map((item) => (
                        <div
                          key={item}
                          className="
                            px-4 py-2
                            rounded-full
                            bg-[#fff9ef]
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
                )}

                {/* FALLBACK */}
                {allergens.length === 0 && additives.length === 0 && (
                  <p className="text-[#7b6a58] text-sm">
                    Keine Allergene oder Zusatzstoffe vorhanden.
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}