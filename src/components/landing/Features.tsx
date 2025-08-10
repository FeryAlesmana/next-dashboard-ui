'use client';
import React from "react";
import { FaChalkboardTeacher, FaTrophy, FaUsers } from "react-icons/fa";

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const Features: React.FC = () => {
  const fitur: Feature[] = [
    {
      icon: <FaUsers size={40} className="text-orange-400 mb-4" />,
      title: "Fasilitas Lengkap",
      desc: "Ruang kelas, laboratorium, dan perpustakaan modern.",
    },
    {
      icon: <FaChalkboardTeacher size={40} className="text-orange-400 mb-4" />,
      title: "Ekstrakurikuler",
      desc: "Beragam pilihan kegiatan untuk pengembangan minat dan bakat.",
    },
    {
      icon: <FaTrophy size={40} className="text-orange-400 mb-4" />,
      title: "Prestasi",
      desc: "Siswa berprestasi di tingkat nasional dan internasional.",
    },
  ];

  return (
    <section id="fitur" className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-white mb-12 drop-shadow">
          Mengapa Memilih Kami?
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {fitur.map((item, i) => (
            <div
              key={i}
              className="bg-white/20 backdrop-blur-md text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/10"
            >
              <div className="flex flex-col items-center">
                {item.icon}
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/90">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
