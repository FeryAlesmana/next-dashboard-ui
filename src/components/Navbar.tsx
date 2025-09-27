"use client";

import Image from "next/image";
import NotificationBell from "./NotificationComp";
import SearchBar from "./PageSearch";

interface NavbarProps {
  onToggleMenu: () => void;
  userProfile: {
    name: string;
    img: string;
    role: string;
  };
}

const Navbar = ({ onToggleMenu, userProfile }: NavbarProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm">
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
        {/* <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={20} height={20} />
        </div> */}
        {/* <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={20} height={20} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </div> */}
        <NotificationBell />
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">
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
