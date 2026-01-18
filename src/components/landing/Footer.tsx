import Link from "next/link";
import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaYoutube,
} from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-br from-blue-900 to-orange-800 text-white">
      {/* Container untuk konten (tetap di tengah) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Grid layout untuk sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Section 1: Info Sekolah */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">SMP Islamiyah Serua</h3>
            <p className="text-orange-100 text-sm leading-relaxed">
              Mewujudkan generasi unggul, berakhlak, dan berprestasi melalui
              pendidikan berkualitas.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://www.facebook.com/profile.php?id=542555109168434&_rdr"
                aria-label="Facebook"
                className="text-white hover:text-orange-300 transition transform hover:scale-110"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="https://www.instagram.com/smp.islamiyahserua/"
                aria-label="Instagram"
                className="text-white hover:text-orange-300 transition transform hover:scale-110"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://www.youtube.com/@yadamistory4196"
                aria-label="Youtube"
                className="text-white hover:text-orange-300 transition transform hover:scale-110"
              >
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          {/* Section 2: Tautan Cepat */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-orange-300 transition flex items-center gap-2"
                >
                  <span>•</span> Beranda
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-300 transition flex items-center gap-2"
                >
                  <span>•</span> Profil Sekolah
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-300 transition flex items-center gap-2"
                >
                  <span>•</span> Program
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-300 transition flex items-center gap-2"
                >
                  <span>•</span> Pendaftaran
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-300 transition flex items-center gap-2"
                >
                  <span>•</span> Galeri
                </a>
              </li>
            </ul>
          </div>

          {/* Section 3: Kontak */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Kontak Kami</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-orange-300" />
                <Link href="https://www.google.com/maps/place/SMP+Islamiyah+Serua/@-6.3689236,106.7382682,17z/data=!4m14!1m7!3m6!1s0x2e69ef44620fcdc5:0x6c18803203109d37!2sSMP+Islamiyah+Serua!8m2!3d-6.3689236!4d106.7382682!16s%2Fg%2F1pzvk1w7f!3m5!1s0x2e69ef44620fcdc5:0x6c18803203109d37!8m2!3d-6.3689236!4d106.7382682!16s%2Fg%2F1pzvk1w7f?entry=ttu&g_ep=EgoyMDI1MTAxMi4wIKXMDSoASAFQAw%3D%3D">
                  <p>Jl. Pendidikan No. 123, Serua, Depok, Jawa Barat 16415</p>
                </Link>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="text-orange-300" />
                <p> +62 821-124-09732 / (021) 742 0065 / (021) 742 7657</p>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-orange-300" />
                <p>smpsmkserua@gmail.com</p>
              </div>
              <div className="flex items-center space-x-3">
                <FaClock className="text-orange-300" />
                <p>Senin-Jumat: 07:00 - 15:00 WIB</p>
              </div>
            </div>
          </div>

          {/* Section 4: Newsletter */}
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-6"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-orange-200 mb-4 md:mb-0">
            © {new Date().getFullYear()} SMP Islamiyah Serua. All rights
            reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6"></div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
