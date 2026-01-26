"use client";
import Image from "next/image";
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
                <h3 className="text-xl font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-white/90">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Program Nasional */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-white mb-8 drop-shadow">
            Didukung Program Nasional
          </h3>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Sekolah Ramah Anak */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center gap-5">
              {/* Logo box */}
              <div className="bg-white rounded-xl w-20 h-20 flex items-center justify-center shadow">
                <Image
                  src="/sra.png"
                  alt="Sekolah Ramah Anak"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>

              <div className="text-left">
                <h4 className="font-semibold text-white">Sekolah Ramah Anak</h4>
                <p className="text-sm text-white/80">
                  Lingkungan belajar yang aman, inklusif, dan bebas perundungan.
                </p>
              </div>
            </div>

            {/* Kurikulum Merdeka */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center gap-5">
              <div className="bg-white rounded-xl w-20 h-20 flex items-center justify-center shadow">
                <Image
                  src="/Kurikulum_merdeka.png"
                  alt="Kurikulum Merdeka"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>

              <div className="text-left">
                <h4 className="font-semibold text-white">Kurikulum Merdeka</h4>
                <p className="text-sm text-white/80">
                  Pembelajaran fleksibel yang berfokus pada minat dan potensi
                  siswa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
