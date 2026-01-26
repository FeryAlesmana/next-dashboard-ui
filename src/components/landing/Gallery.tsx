"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
type gallery = {
  id: number;
  imageUrl: string;
};
type imagesDb = { DBimages?: gallery[]; role?: string };
const Gallery: React.FC<imagesDb> = ({ DBimages, role }) => {
  const images =
    DBimages && DBimages.length > 0
      ? DBimages.map((s) => s.imageUrl)
      : [
          "/kelas1.jpeg",
          "/eskul1.jpeg",
          "/perpus1.jpeg",
          "/sekolah3.jpeg",
          "/siswa.jpeg",
          "/lab1.jpeg",
        ];

  return (
    <section id="galeri" className="py-24 px-6">
      <div className="relative max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold mb-12 text-white drop-shadow">
          Galeri Kegiatan
        </h2>
        {role === "admin" && (
          <Link
            href="/settings"
            className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-lamaPurple text-black rounded-full p-2 shadow transition"
            title="Edit slides"
          >
            <Image src="/updateDark.png" alt="edit" width={16} height={16} />
          </Link>
        )}

        <div
          className={`grid gap-6 ${
            images.length === 1
              ? "grid-cols-1 place-items-center"
              : "grid-cols-2 md:grid-cols-3"
          }`}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="relative w-full max-w-md aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-white/10 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={img}
                alt={`Galeri ${i + 1}`}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
                quality={90}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
