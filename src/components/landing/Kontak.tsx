"use client";
import Link from "next/link";
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
          Hubungi kami untuk informasi lebih lanjut seputar pendaftaran,
          kegiatan sekolah, dan lainnya.
        </p>

        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl text-left space-y-6 border-l-4 border-orange-400">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100/20 p-3 rounded-full">
              <FaMapMarkerAlt className="text-orange-400 text-xl" />
            </div>
            <div >
              <Link 
              href="https://www.google.com/maps/place/SMP+Islamiyah+Serua/@-6.3689236,106.7382682,17z/data=!4m14!1m7!3m6!1s0x2e69ef44620fcdc5:0x6c18803203109d37!2sSMP+Islamiyah+Serua!8m2!3d-6.3689236!4d106.7382682!16s%2Fg%2F1pzvk1w7f!3m5!1s0x2e69ef44620fcdc5:0x6c18803203109d37!8m2!3d-6.3689236!4d106.7382682!16s%2Fg%2F1pzvk1w7f?entry=ttu&g_ep=EgoyMDI1MTAxMi4wIKXMDSoASAFQAw%3D%3D">
                <p className="text-sm font-semibold text-white/80 ">Alamat</p>
                <p className="text-white hover:bg-gray-600 rounded-md p-2">
                  Jl. Serua Raya No. 23, Kel. Serua, Kec. Bojongsari, Kota Depok
                </p>
              </Link>
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
