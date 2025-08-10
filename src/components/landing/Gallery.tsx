"use client";
import Image from "next/image";
import React from "react";

const Gallery: React.FC = () => {
  const images: string[] = [
    "/kelas1.jpeg",
    "/eskul1.jpeg",
    "/perpus1.jpeg",
    "/sekolah3.jpeg",
    "/siswa.jpeg",
    "/lab1.jpeg",
  ];

  return (
    <section id="galeri" className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold mb-12 text-white drop-shadow">
          Galeri Kegiatan
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((img, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/10 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300"
            >
              <Image
                width={340}
                height={192}
                src={img}
                alt={`Galeri ${i + 1}`}
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500 ease-in-out"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
