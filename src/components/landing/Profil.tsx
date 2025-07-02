'use client';
import React from "react";
import { FaSchool, FaAward, FaCalendarAlt } from "react-icons/fa";

const Profil: React.FC = () => {
  return (
    <section id="profil" className="py-24 px-6 text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow">
          Profil Sekolah
        </h2>
        <p className="text-white/90 text-lg mb-12 max-w-4xl mx-auto leading-relaxed drop-shadow">
          SMP Islamiyyah Serua adalah SMPI swasta yang didirikan pertama kali pada tahun 1985.
          Sekarang SMP Islamiyyah Serua menggunakan kurikulum Merdeka Belajar, dan berada di bawah
          naungan Yayasan Wiyata Mandala Muslimin Indonesia dengan dukungan 25 guru yang kompeten di bidangnya.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left mt-8">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border-l-4 border-blue-300 shadow-md hover:shadow-lg transition">
            <FaSchool className="text-4xl text-orange-400 mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">Visi Kami</h3>
            <p className="text-white/80">
              Menghasilkan lulusan yang cerdas, terampil, mandiri, dan berakhlak mulia, unggul dalam prestasi, iman, dan taqwa.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border-l-4 border-orange-400 shadow-md hover:shadow-lg transition">
            <FaAward className="text-4xl text-blue-300 mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">Prestasi</h3>
            <p className="text-white/80">
              Ratusan penghargaan tingkat kota hingga nasional dalam bidang akademik, seni, dan olahraga.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border-l-4 border-blue-300 shadow-md hover:shadow-lg transition">
            <FaCalendarAlt className="text-4xl text-orange-400 mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">Sejarah</h3>
            <p className="text-white/80">
              Berdiri sejak 1985, tumbuh menjadi institusi pendidikan pilihan orang tua di berbagai wilayah.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profil;
