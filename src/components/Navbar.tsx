"use client";

import Image from "next/image";
import NotificationBell from "./NotificationComp";
import SearchBar from "./PageSearch";
import { useEffect, useRef, useState } from "react";

interface NavbarProps {
  onToggleMenu: () => void;
}

interface UserProfile {
  name: string;
  img: string;
  role: string;
  staffRole?: string;
}

const Navbar = ({ onToggleMenu }: NavbarProps) => {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollRef = useRef(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Loading...",
    img: "/avatar.png",
    role: "",
    staffRole: "",
  });
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const container = document.getElementById("scroll-container");
    if (!container) return;

    const handleScroll = () => {
      const current = container.scrollTop;
      const last = lastScrollRef.current;

      if (window.innerWidth < 1024) {
        if (current > last && current > 60) {
          setIsHidden(true);
        } else {
          setIsHidden(false);
        }
      }

      lastScrollRef.current = current;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function translateStaffRole(role: string): string {
    switch (role) {
      case "PENILAIAN":
        return "Penilaian & Kesiswaan";
      case "PENJADWALAN":
        return "Penjadwalan";
      case "ACCOUNTING":
        return "Akuntansi";
      default:
        return role;
    }
  }
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div
      className={`
        flex items-center justify-between p-4 bg-white shadow-sm

        sticky top-0 z-50 transition-transform duration-300
        ${isHidden ? "-translate-y-full" : "translate-y-0"}

        lg:static lg:translate-y-0
      `}
    >
      {/* Burger button */}
      <button
        onClick={onToggleMenu}
        className="lg:hidden bg-white p-2 rounded-md border border-gray-300"
      >
        <Image src="/burger.png" alt="Menu" width={20} height={20} />
      </button>

      {/* Search */}

      <SearchBar role={userProfile.role!} />

      {/* Profile Section */}
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="relative flex items-center gap-3">
          {/* 1. Name and Role Container */}
          <div
            className={`
        ${showDetails ? "flex" : "hidden"} 
        md:flex flex-col items-end
        absolute right-12 top-0 bg-white p-2 rounded-md shadow-md border
        md:static md:bg-transparent md:p-0 md:shadow-none md:border-none
        z-50 min-w-[120px]
      `}
          >
            <span
              className="text-xs leading-3 font-medium max-w-[150px] md:max-w-[300px] 
                   overflow-hidden text-ellipsis whitespace-nowrap"
              title={userProfile.name}
            >
              {userProfile.name}
            </span>
            <span className="text-[10px] text-gray-500 p-1">
              {userProfile.role === "staff" ? (
                <span>{translateStaffRole(userProfile.staffRole!)}</span>
              ) : (
                <span>{userProfile.role}</span>
              )}
            </span>
          </div>

          {/* 2. Avatar Trigger */}
          <div
            className="w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-lamaBlue transition-all"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Image
              src={userProfile.img}
              alt="User Avatar"
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
