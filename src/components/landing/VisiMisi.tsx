'use client';
import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const VisiMisi: React.FC = () => {
  const misi: string[] = [
    "Menciptakan profil pelajar yang berakhlak mulia.",
    "Menciptakan pembelajaran yang menarik, menyenangkan, dan berkarakter yang mampu memfasilitasi pelajar sesuai bakat dan minatnya.",
    "Meningkatkan manajemen satuan pendidikan yang adaptif, berkarakter, dan menjamin mutu.",
    "Menciptakan lingkungan sekolah sebagai tempat perkembangan intelektual, sosial, emosional, keterampilan, dan pengembangan budaya lokal dalam kebhinekaan global.",
    "Menciptakan profil pelajar yang mandiri, bernalar kritis, dan kreatif sehingga mampu mengreasi ide dan keterampilan.",
  ];

  return (
    <section id="visi-misi" className="py-24 px-6 text-white text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold mb-12 drop-shadow-lg">
          Visi & Misi
        </h2>

        {/* Visi */}
        <div className="mb-16 bg-white/10 backdrop-blur-md rounded-2xl p-8 border-l-4 border-orange-400 shadow-lg">
          <h3 className="text-2xl font-semibold text-orange-300 mb-4">Visi</h3>
          <p className="text-white/90 text-lg leading-relaxed">
            Menghasilkan lulusan yang{" "}
            <span className="font-semibold text-white">cerdas</span>,
            <span className="font-semibold text-white"> terampil</span>,
            <span className="font-semibold text-white"> mandiri</span>, dan
            <span className="font-semibold text-white"> berakhlak mulia</span>,
            unggul dalam prestasi, iman, dan taqwa.
          </p>
        </div>

        {/* Misi */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-l-4 border-blue-300 shadow-lg">
          <h3 className="text-2xl font-semibold text-blue-200 mb-6">Misi</h3>
          <ul className="text-left space-y-5 max-w-4xl mx-auto">
            {misi.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <FaCheckCircle className="text-orange-400 mt-1 shrink-0" />
                <span className="text-white/90 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default VisiMisi;
