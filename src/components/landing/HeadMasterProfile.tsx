import Image from "next/image";
import React from "react";

interface HeadmasterProfileProps {
  photo: string; // URL foto kepala sekolah
  name?: string;
  title?: string;
  description?: string;
}

const HeadmasterProfile: React.FC<HeadmasterProfileProps> = ({
  photo,
  name = "Bpk. Murtado, S.Pd.I, M.M, M.Pd",
  title = "Kepala Sekolah",
  description = "Kepala sekolah yang berkomitmen dalam meningkatkan kualitas pendidikan, inovasi pembelajaran, dan pengelolaan sekolah berbasis teknologi.",
}) => {
  return (
    <section className="relative py-24 px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-white drop-shadow-lg">
        Kepala Sekolah
      </h2>

      <div
        className="mx-auto max-w-md flex flex-col items-center p-8
        bg-white/10 backdrop-blur-md rounded-2xl shadow-lg
        border-b-4 border-orange-400 hover:border-blue-300
        transition-all duration-300"
      >
        {/* Foto */}
        <div className="mb-6">
          <Image
            src={photo}
            alt={name}
            width={180}
            height={180}
            className="rounded-full object-cover border-4 border-white/20"
          />
        </div>

        {/* Nama */}
        <h3 className="text-white/90 font-semibold text-xl leading-tight">
          {name}
        </h3>

        {/* Jabatan */}
        <p className="text-orange-200 italic text-sm mt-1">
          {title}
        </p>

        {/* Deskripsi */}
        <p className="text-white/80 text-sm md:text-base mt-6 leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
};

export default HeadmasterProfile;
