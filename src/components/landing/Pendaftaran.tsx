'use client';
import React from 'react';
import { FaClipboardCheck, FaCheck } from 'react-icons/fa';

const syaratPendaftaran: string[] = [
  'Mengisi formulir pendaftaran.',
  'Lulus Sekolah Dasar (SD) atau Madrasah Ibtidaiyah (MI).',
  'Melampirkan fotokopi Ijazah atau STTB terakhir yang telah dilegalisir.',
  'Melampirkan fotokopi akta kelahiran atau surat lahir.',
  'Menyerahkan pas foto ukuran 3x4 sebanyak 4 lembar dan 2x3 sebanyak 4 lembar.',
  'Menyerahkan fotokopi: Kartu Keluarga (KK), KTP orang tua (ayah dan ibu), KIP/KIS/KKS/PKH/SKTM (bagi yang memiliki).',
];

const Pendaftaran: React.FC = () => {
  return (
    <section id="pendaftaran" className="py-24 px-6 text-white text-center">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mx-auto mb-4 shadow">
            <FaClipboardCheck className="text-orange-400 text-3xl" />
          </div>
          <h2 className="text-4xl font-bold drop-shadow">Syarat Pendaftaran</h2>
          <p className="text-white/90 text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            Silakan lengkapi semua dokumen dan persyaratan berikut untuk mendaftar sebagai siswa baru di SMP Islamiyyah:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {syaratPendaftaran.map((item, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-md border-l-4 border-orange-400 p-5 rounded-xl flex items-start gap-4 shadow-md hover:shadow-xl transition hover:border-blue-300"
            >
              <div className="mt-1 text-orange-300 text-xl">
                <FaCheck />
              </div>
              <p className="text-white/90 text-left leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pendaftaran;
