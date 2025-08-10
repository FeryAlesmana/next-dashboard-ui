import React from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

const CTA: React.FC = () => {
  return (
    <section
      id="daftar"
      className="relative py-24 px-6 text-center"
    >
      {/* Content with white text and subtle glow */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
          Bergabunglah Bersama Kami
        </h2>
        <p className="text-lg md:text-xl mb-8 font-light text-white/90">
          Mari wujudkan masa depan cemerlang bersama <strong className="font-semibold text-orange-200">SMP Islamiyyah</strong>.
          Pendidikan terbaik untuk generasi terbaik.
        </p>
        <Link href="/daftar">
          <button className="inline-flex items-center gap-2 bg-white text-orange-600 hover:text-orange-700 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105">
            Daftar Sekarang <FaArrowRight className="animate-bounce-x" />
          </button>
        </Link>
      </div>
    </section>
  );
};

export default CTA;