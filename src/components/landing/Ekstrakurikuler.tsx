'use client';
import React from 'react';

interface Kegiatan {
  nama: string;
  gambar: string;
}

const ekstrakurikuler: Kegiatan[] = [
  { nama: 'Futsal', gambar: '/eskul1.jpeg' },
  { nama: 'Pencak Silat', gambar: '/eskul1.jpeg' },
  { nama: 'Paskibra', gambar: '/eskul1.jpeg' },
  { nama: 'Hadroh', gambar: '/eskul1.jpeg' },
  { nama: 'Tari Saman', gambar: '/eskul1.jpeg' },
  { nama: 'Marawis', gambar: '/eskul1.jpeg' },
  { nama: 'Drumband', gambar: '/eskul1.jpeg' },
  { nama: 'Angklung', gambar: '/eskul1.jpeg' },
  { nama: 'Pramuka', gambar: '/eskul1.jpeg' },
  { nama: 'Taekwondo', gambar: '/eskul1.jpeg' },
  { nama: 'Gamelan', gambar: '/eskul1.jpeg' },
  { nama: 'Panahan', gambar: '/eskul1.jpeg' },
];

const penunjang: string[] = [
  'Life Skill',
  'Outing',
  'Out Bound',
  'Pesantren Kilat',
];

const Ekstrakurikuler: React.FC = () => {
  return (
    <section
      id="ekstrakurikuler"
      className="py-16 md:py-24"
    >
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-12 drop-shadow-lg">
          Ekstrakurikuler & Kegiatan Penunjang
        </h2>

        {/* Ekstrakurikuler */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20">
          {ekstrakurikuler.map((item, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 hover:-translate-y-1 border border-white/20 hover:border-orange-300/50"
            >
              <img
                src={item.gambar}
                alt={item.nama}
                className="w-full h-40 object-cover rounded-lg mb-4 border-2 border-white/30 hover:border-orange-400 transition"
              />
              <h3 className="text-lg font-semibold text-white">{item.nama}</h3>
            </div>
          ))}
        </div>

        {/* Kegiatan Penunjang */}
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Kegiatan Penunjang</h3>
          <ul className="flex flex-wrap justify-center gap-4">
            {penunjang.map((item, i) => (
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