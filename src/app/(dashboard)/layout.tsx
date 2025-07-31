"use client";
import Link from "next/link";
import Image from "next/image";
import Menu from "@/components/Menu";
import { useState } from "react";
import NavbarContainer from "@/components/NavbarContainer";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex relative">
      {/* LEFT SIDEBAR */}
      <div
        className={`fixed z-30 top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0 lg:static w-1/2 lg:w-[16%] xl:w-[14%]
  p-4 gap-4 overflow-y-auto text-base lg:text-[13px]
  direction-rtl scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100
  min-w-[200px]`} // <-- add this
      >
        <Link
          href="/"
          className="flex items-center justify-center gap-2 lg:justify-start mb-6"
        >
          <Image
            src="https://res.cloudinary.com/dbfascepc/image/upload/v1753534026/favicon_iqgit7.png"
            alt="logo"
            width={32}
            height={32}
          />
          <span className=" lg:block font-bold text-lg">
            SMP Islamiyah Serua
          </span>
        </Link>
        <Menu />
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 flex flex-col bg-[#F7F8FA] overflow-y-auto">
        <NavbarContainer onToggleMenu={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-4">{children}</div>
      </div>

      {/* BACKDROP ON MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
