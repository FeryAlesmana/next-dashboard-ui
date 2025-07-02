'use client';
import React from 'react';
import {
  FaBuilding,
  FaChalkboardTeacher,
  FaShieldAlt,
  FaFutbol,
  FaUtensils,
  FaStore,
  FaMosque,
  FaLaptop,
} from 'react-icons/fa';

interface FasilitasItem {
  nama: string;
  ikon: React.ReactNode;
}

const fasilitas: FasilitasItem[] = [
  { nama: 'Ruang Kelas Bersih', ikon: <FaChalkboardTeacher className="text-orange-400 text-3xl" /> },
  { nama: 'Gedung 3 Lantai Milik Sendiri', ikon: <FaBuilding className="text-orange-400 text-3xl" /> },
  { nama: 'Lapangan Olahraga', ikon: <FaFutbol className="text-orange-400 text-3xl" /> },
  { nama: 'Lapangan Futsal', ikon: <FaFutbol className="text-orange-400 text-3xl" /> },
  { nama: 'Musholla', ikon: <FaMosque className="text-orange-400 text-3xl" /> },
  { nama: 'Kantin', ikon: <FaUtensils className="text-orange-400 text-3xl" /> },
  { nama: 'Koperasi', ikon: <FaStore className="text-orange-400 text-3xl" /> },
  { nama: 'Keamanan 24 Jam', ikon: <FaShieldAlt className="text-orange-400 text-3xl" /> },
  { nama: 'Lab. Komputer', ikon: <FaLaptop className="text-orange-400 text-3xl" /> },
];

const Fasilitas: React.FC = () => {
  return (
    <section id="fasilitas" className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-white mb-12 drop-shadow">
          Fasilitas Sekolah
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {fasilitas.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-white/20 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-2xl transition hover:-translate-y-1"
            >
              <div className="flex-shrink-0">{item.ikon}</div>
              <p className="text-white font-medium">{item.nama}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Fasilitas;
