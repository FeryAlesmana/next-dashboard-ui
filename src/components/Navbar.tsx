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
}

const Navbar = ({ onToggleMenu }: NavbarProps) => {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollRef = useRef(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Loading...",
    img: "/avatar.png",
    role: "",
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
        <div className="flex flex-col">
          <span
            className="text-xs leading-3 font-medium max-w-full md:max-w-[300px] 
               overflow-hidden text-ellipsis whitespace-nowrap"
            title={userProfile.name}
          >
            {userProfile.name}
          </span>
          <span className="text-[10px] text-gray-500 text-right">
            {userProfile.role}
          </span>
        </div>
        <div className="w-9 h-9 rounded-full overflow-hidden">
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
  );
};

export default Navbar;
