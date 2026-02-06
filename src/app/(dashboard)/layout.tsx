"use client";
import Link from "next/link";
import Image from "next/image";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
type UserDb = {
  id?: string;
  role?: string;
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userDb, setUserDb] = useState<UserDb>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoaded } = useUser();

  const fetchUserDB = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/find-id?clerkId=${userId}`);
      const data = await res.json();
      setUserDb(data);
    } catch (error) {
      console.error("Failed to fetch student payments:", error);
    }
  };
  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchUserDB(user?.id);
    }
  }, [user?.id, isLoaded]); // Only runs when these values change
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
          className="flex items-center justify-center gap-2 lg:justify-start mb-6 bg-lamaBlue shadow-md rounded-md p-2 hover:bg-gray-400"
        >
          <Image
            src="https://res.cloudinary.com/dbfascepc/image/upload/v1753534026/favicon_iqgit7.png"
            alt="logo"
            width={32}
            height={32}
          />
          <span className="font-bold text-lg">
            <span className="hidden lg:inline">SMP Islamiyah Serua</span>
            <span className="inline lg:hidden">SMPI Serua</span>
          </span>
        </Link>
        <Menu
          onLinkClick={() => setSidebarOpen(false)}
          isLoaded={isLoaded}
          userDb={userDb}
        />
      </div>

      {/* RIGHT CONTENT */}
      <div
        className="flex-1 flex flex-col bg-[#F7F8FA] min-h-screen"
        id="scroll-container"
      >
        <Navbar onToggleMenu={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        <footer className="border-t bg-white text-gray-500 text-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2">
            <p>
              © {new Date().getFullYear()} SMP Islamiyah Serua. All rights
              reserved.
            </p>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-400">PPDB System</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-gray-400">v2.0</span>
            </div>
          </div>
        </footer>
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
