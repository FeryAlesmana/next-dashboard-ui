import React from "react";
import { 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaClock
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
            <h3 className="text-xl font-bold">SMP Islamiyyah Serua</h3>
            <p className="text-orange-100 text-sm leading-relaxed">
              Mewujudkan generasi unggul, berakhlak, dan berprestasi melalui pendidikan berkualitas.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" aria-label="Facebook" className="text-white hover:text-orange-300 transition transform hover:scale-110">
                <FaFacebookF size={18} />
              </a>
              <a href="#" aria-label="Instagram" className="text-white hover:text-orange-300 transition transform hover:scale-110">
                <FaInstagram size={18} />
              </a>
              <a href="#" aria-label="Twitter" className="text-white hover:text-orange-300 transition transform hover:scale-110">
                <FaTwitter size={18} />
              </a>
            </div>
          </div>

          {/* Section 2: Tautan Cepat */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-orange-300 transition flex items-center gap-2"><span>•</span> Beranda</a></li>
              <li><a href="#" className="hover:text-orange-300 transition flex items-center gap-2"><span>•</span> Profil Sekolah</a></li>
              <li><a href="#" className="hover:text-orange-300 transition flex items-center gap-2"><span>•</span> Program</a></li>
              <li><a href="#" className="hover:text-orange-300 transition flex items-center gap-2"><span>•</span> Pendaftaran</a></li>
              <li><a href="#" className="hover:text-orange-300 transition flex items-center gap-2"><span>•</span> Galeri</a></li>
            </ul>
          </div>

          {/* Section 3: Kontak */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Kontak Kami</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-orange-300" />
                <p>Jl. Pendidikan No. 123, Serua, Depok, Jawa Barat 16415</p>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="text-orange-300" />
                <p>(021) 1234-5678</p>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-orange-300" />
                <p>info@smpislamiyyah.sch.id</p>
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
            © {new Date().getFullYear()} SMP Islamiyyah Serua. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <a href="#" className="hover:text-orange-300 transition">Kebijakan Privasi</a>
            <a href="#" className="hover:text-orange-300 transition">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-orange-300 transition">Peta Situs</a>
            <a href="#" className="hover:text-orange-300 transition">FAQ</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;