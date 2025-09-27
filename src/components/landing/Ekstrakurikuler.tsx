"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Kegiatan {
  name: string;
  imageUrl: string;
}

const defaultEkstrakurikuler: Kegiatan[] = [
  { name: "Futsal", imageUrl: "/eskul1.jpeg" },
  { name: "Pencak Silat", imageUrl: "/eskul1.jpeg" },
  { name: "Paskibra", imageUrl: "/eskul1.jpeg" },
  { name: "Hadroh", imageUrl: "/eskul1.jpeg" },
  { name: "Tari Saman", imageUrl: "/eskul1.jpeg" },
  { name: "Marawis", imageUrl: "/eskul1.jpeg" },
  { name: "Drumband", imageUrl: "/eskul1.jpeg" },
  { name: "Angklung", imageUrl: "/eskul1.jpeg" },
  { name: "Pramuka", imageUrl: "/eskul1.jpeg" },
  { name: "Taekwondo", imageUrl: "/eskul1.jpeg" },
  { name: "Gamelan", imageUrl: "/eskul1.jpeg" },
  { name: "Panahan", imageUrl: "/eskul1.jpeg" },
];

const defaultPenunjang: string[] = [
  "Life Skill",
  "Outing",
  "Out Bound",
  "Pesantren Kilat",
];

const Ekstrakurikuler = ({
  eskul,
  penunjangDb,
  role,
}: {
  eskul?: Kegiatan[];
  penunjangDb?: string[];
  role?: string;
}) => {
  const kegiatanEskul =
    eskul && eskul.length > 0 ? eskul : defaultEkstrakurikuler;
  const kegiatanPenunjang =
    penunjangDb && penunjangDb.length > 0 ? penunjangDb : defaultPenunjang;
  return (
    <section id="ekstrakurikuler" className="py-16 md:py-24">
      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-12 drop-shadow-lg">
          Ekstrakurikuler & Kegiatan Penunjang
        </h2>
        {role === "admin" && (
          <Link
            href="/settings"
            className="absolute top-4 right-3 z-20 bg-white/80 hover:bg-lamaPurple text-black rounded-full p-2 shadow transition"
            title="Edit slides"
          >
            <Image src="/updateDark.png" alt="edit" width={16} height={16} />
          </Link>
        )}
        {/* Ekstrakurikuler */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20">
          {kegiatanEskul.map((item, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 hover:-translate-y-1 border border-white/20 hover:border-orange-300/50"
            >
              <Image
                width={300}
                height={300}
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-40 object-cover rounded-lg mb-4 border-2 border-white/30 hover:border-orange-400 transition"
              />
              <h3 className="text-lg font-semibold text-white">{item.name}</h3>
            </div>
          ))}
        </div>

        {/* Kegiatan Penunjang */}
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Kegiatan Penunjang
          </h3>
          <ul className="flex flex-wrap justify-center gap-4">
            {kegiatanPenunjang.map((item, i) => (
              <li
                key={i}
                className="bg-white/20 text-white border border-white/30 px-5 py-2 rounded-full shadow hover:bg-orange-500/30 hover:border-orange-400 transition backdrop-blur-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Ekstrakurikuler;
