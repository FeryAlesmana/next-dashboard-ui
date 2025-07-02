"use client";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
// import LoginModal from "./LoginModal";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaHome,
  FaInfoCircle,
  FaImages,
  FaEnvelope,
  FaUserPlus,
} from "react-icons/fa";
import { FaMosque } from "react-icons/fa6";

const NavbarHome: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  useEffect(() => {
    const role = user?.publicMetadata.role;

    if (isSignedIn) {
      router.push(`/${role}`);
    }
  }, [user, router, isSignedIn]);
  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-50 to-orange-50/50 backdrop-blur-md shadow-sm z-50 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            {/* Logo Sekolah */}
            <div className="flex items-center space-x-2">
              <FaMosque className="text-orange-500 text-2xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-orange-600 bg-clip-text text-transparent">
                SMP Islamiyah Serua
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <NavLink href="#home" icon={<FaHome />}>
                Home
              </NavLink>
              <NavLink href="#profil" icon={<FaInfoCircle />}>
                Profil
              </NavLink>
              <NavLink href="#galeri" icon={<FaImages />}>
                Galeri
              </NavLink>
              <NavLink href="#kontak" icon={<FaEnvelope />}>
                Kontak
              </NavLink>
              <NavLink href="#daftar" icon={<FaUserPlus />}>
                Daftar
              </NavLink>
              <button
                onClick={() => redirect("/sign-in")}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white px-4 py-2 rounded-full hover:shadow-md transition-all duration-300"
              >
                <FaUser className="text-sm" />
                <span>Login</span>
              </button>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full text-blue-800 hover:bg-white/30 transition"
                aria-label={showMenu ? "Tutup menu" : "Buka menu"}
              >
                {showMenu ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMenu && (
            <div className="md:hidden bg-white/90 backdrop-blur-sm rounded-lg mt-3 p-4 space-y-3 shadow-lg border border-white/20">
              <MobileNavLink
                href="#home"
                icon={<FaHome />}
                onClick={() => setShowMenu(false)}
              >
                Home
              </MobileNavLink>
              <MobileNavLink
                href="#profil"
                icon={<FaInfoCircle />}
                onClick={() => setShowMenu(false)}
              >
                Profil
              </MobileNavLink>
              <MobileNavLink
                href="#galeri"
                icon={<FaImages />}
                onClick={() => setShowMenu(false)}
              >
                Galeri
              </MobileNavLink>
              <MobileNavLink
                href="#kontak"
                icon={<FaEnvelope />}
                onClick={() => setShowMenu(false)}
              >
                Kontak
              </MobileNavLink>
              <MobileNavLink
                href="#daftar"
                icon={<FaUserPlus />}
                onClick={() => setShowMenu(false)}
              >
                Daftar
              </MobileNavLink>
              <button
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white px-4 py-3 rounded-lg hover:shadow-md transition-all duration-300 mt-2"
                onClick={() => {
                  setIsOpen(true);
                  setShowMenu(false);
                }}
              >
                <FaUser />
                <span>Login</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {/* {isOpen && <LoginModal onClose={() => setIsOpen(false)} />} */}
    </>
  );
};

// Komponen untuk NavLink Desktop
const NavLink: React.FC<{
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ href, icon, children }) => (
  <a
    href={href}
    className="flex items-center space-x-2 text-blue-800 hover:text-orange-600 transition-colors duration-200 group"
  >
    <span className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {icon}
    </span>
    <span>{children}</span>
  </a>
);

// Komponen untuk MobileNavLink
const MobileNavLink: React.FC<{
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}> = ({ href, icon, children, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    className="flex items-center space-x-3 py-2 px-3 text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
  >
    <span className="text-orange-500">{icon}</span>
    <span>{children}</span>
  </a>
);

export default NavbarHome;
