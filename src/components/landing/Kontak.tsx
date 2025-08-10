'use client';
import React from "react";
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";

const Kontak: React.FC = () => {
  return (
    <section id="kontak" className="py-24 px-6">
      <div className="relative z-10 max-w-3xl mx-auto text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow">
          Kontak Kami
        </h2>
        <p className="text-white/90 text-lg mb-10 drop-shadow">
          Hubungi kami untuk informasi lebih lanjut seputar pendaftaran, kegiatan sekolah, dan lainnya.
        </p>

        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl text-left space-y-6 border-l-4 border-orange-400">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100/20 p-3 rounded-full">
              <FaMapMarkerAlt className="text-orange-400 text-xl" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">Alamat</p>
              <p className="text-white">Jl. Serua Raya No. 23, Kel. Serua, Kec. Bojongsari, Kota Depok</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-orange-100/20 p-3 rounded-full">
              <FaEnvelope className="text-orange-400 text-xl" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">Email</p>
              <p className="text-white">smpsmkserua@gmail.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-orange-100/20 p-3 rounded-full">
              <FaPhoneAlt className="text-orange-400 text-xl" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">Telepon</p>
              <p className="text-white">(021) 742 0065</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Kontak;
