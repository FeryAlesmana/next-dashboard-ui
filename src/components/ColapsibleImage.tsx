"use client";
import { useState } from "react";
import Image from "next/image";

export function CollapsibleImage({ src }: { src: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="mt-3 border rounded-md overflow-hidden cursor-pointer transition-all"
      onClick={() => setOpen(!open)}
    >
      {/* Image wrapper */}
      <div
        className={`
          relative w-full transition-all duration-300 overflow-hidden 
          ${open ? "max-h-[600px]" : "max-h-[100px]"}
        `}
      >
        {/* Image itself */}
        <Image
          src={src}
          alt="event image"
          width={1600}
          height={900}
          className={`
            w-full object-cover transition-all duration-300
            ${open ? "object-top" : "object-top"}
          `}
        />
      </div>

      {/* Label below */}
      <div className="bg-black/20 text-white text-xs py-1 text-center">
        {open ? "Tutup" : "Tampilkan"}
      </div>
    </div>
  );
}
