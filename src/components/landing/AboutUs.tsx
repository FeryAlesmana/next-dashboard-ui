import Image from "next/image";
import Link from "next/link";
import React from "react";

interface TeamMember {
  name: string;
  job: string;
  photo: string; // URL to photo
}

interface AboutProps {
  team: TeamMember[];
  websiteName?: string;
  description?: string;
  role?: string;
}

const AboutUs: React.FC<AboutProps> = ({
  team,
  websiteName = "Website",
  description = "A platform for managing student data and imports.",
  role,
}) => {
  return (
    <div className="about-us-container relative py-24 px-6 text-center">
      {role === "admin" && (
        <Link
          href="/settings"
          className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-lamaPurple text-black rounded-full p-2 shadow transition"
          title="Edit slides"
        >
          <Image src="/updateDark.png" alt="edit" width={16} height={16} />
        </Link>
      )}
      <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
        Tentang {websiteName}
      </h1>

      <section style={{ marginBottom: "40px", textAlign: "center" }}>
        <h2 className="font-semibold text-orange-200 text-xl mb-4">
          Kenapa Situs Web Ini dibuat?
        </h2>
        <p className="text-lg md:text-xl mb-8 font-light text-white/90">
          Website ini dibuat untuk{" "}
          <strong>mengelola dan mengawasi data siswa secara online</strong>{" "}
          dengan fitur-fitur utama berupa <strong>PPDB Online</strong>,{" "}
          <strong>Presensi Online</strong>, dan{" "}
          <strong>Manajemen Pembayaran SPP</strong>. Sistem ini dirancang agar
          proses administrasi sekolah menjadi lebih efisien, akurat, dan dapat
          diakses kapan saja dari mana saja. Website ini merupakan{" "}
          <strong>Tugas Akhir Mahasiswa S1 Universitas Pamulang (UNPAM)</strong>{" "}
          yang dikembangkan untuk memberikan solusi nyata bagi kebutuhan
          pengelolaan data siswa di era digital.
        </p>
      </section>

      <section style={{ marginBottom: "40px", textAlign: "center" }}>
        <h2 className="font-semibold text-orange-200 text-xl mb-4">
          Tujuan Situs Web Ini
        </h2>
        <p className="text-lg md:text-xl mb-8 font-light text-white/90">
          Tujuan utama dari website ini adalah{" "}
          <strong>
            mempermudah sekolah dalam mengelola data siswa secara terpusat dan
            real-time
          </strong>
          . Dengan adanya PPDB Online, orang tua dapat mendaftarkan anak tanpa
          antre. Presensi Online memungkinkan guru mencatat kehadiran secara
          digital, dan Manajemen SPP membantu sekolah melacak pembayaran dengan
          transparan. Semua fitur ini dibangun untuk mengurangi pekerjaan
          manual, mencegah human error, dan meningkatkan akuntabilitas.
        </p>
      </section>

      <section style={{ textAlign: "center" }}>
        <h2 className="font-semibold text-orange-200 text-xl mb-4">
          Siapa yang Membuatnya?
        </h2>
        <p className="text-lg md:text-xl mb-8 font-light text-white/90">
          Situs web ini dibuat oleh tim kecil yang terdiri dari dua orang
          Mahasiswa <strong>UNPAM</strong>. Kami adalah pengembang yang
          passionate dengan solusi pendidikan berbasis web.
        </p>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {team.map((member, index) => (
            <div
              key={index}
              className="flex flex-col items-center w-64 p-6 bg-white/10 backdrop-blur-md 
                 rounded-xl shadow-md hover:shadow-xl transition-all duration-300
                 border-b-4 border-orange-400 hover:border-blue-300"
            >
              {/* Foto: selalu bulat & tengah */}
              <div className="mb-4">
                <Image
                  width={160}
                  height={160}
                  src={member.photo}
                  alt={member.name}
                  className="rounded-full object-cover border-4 border-white/20"
                />
              </div>

              {/* Teks: tengah, batasi lebar, wrap jika panjang */}
              <div className="text-center flex-1 flex flex-col justify-center">
                <h3 className="text-white/90 font-semibold text-lg leading-tight">
                  {member.name}
                </h3>
                <p className="text-white/70 italic text-sm mt-1 leading-tight">
                  {member.job}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
