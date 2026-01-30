"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa6";

// Define your list pages here
const allPages = [
  {
    name: "Pemberitahuan",
    path: "/list/announcements",
    roles: ["admin", "teacher", "student", "parent", "staff"],
  },
  {
    name: "Event",
    path: "/list/events",
    roles: ["admin", "teacher", "student", "parent", "staff"],
  },
  {
    name: "Daftar",
    path: "/daftar",
    roles: ["admin", "teacher", "student", "parent", "staff"],
  },
  {
    name: "Home",
    path: "/",
    roles: ["admin", "teacher", "student", "parent", "staff"],
  },
  {
    name: "Settings",
    path: "/settings",
    roles: ["admin", "staff"],
  },
  {
    name: "Staff",
    path: "/list/staffs",
    roles: ["admin", "staff"],
  },
  {
    name: "Users",
    path: "/list/users",
    roles: ["admin", "staff"],
  },
  {
    name: "Tugas",
    path: "/list/assignments",
    roles: ["admin", "teacher", "student", "parent", "staff"],
  },
  {
    name: "Jadwal",
    path: "/list/lessons",
    roles: ["admin", "teacher", "student", "parent", "staff"],
  },
  {
    name: "Kehadiran",
    path: "/list/attendance",
    roles: ["admin", "teacher", "student", "parent", "staff"],
  },
  { name: "PPDB", path: "/list/ppdb", roles: ["admin", "staff"] },
  {
    name: "Kelas",
    path: "/list/classes",
    roles: ["admin", "teacher", "staff"],
  },
  {
    name: "Ujian",
    path: "/list/exams",
    roles: ["admin", "teacher", "student", "parent", "staff"],
  },
  {
    name: "Keuangan",
    path: "/list/payment",
    roles: ["admin", "teacher", "student", "parent", "staff"],
  },
  {
    name: "Wali Murid",
    path: "/list/parents",
    roles: ["admin", "teacher", "staff"],
  },
  {
    name: "Nilai",
    path: "/list/results",
    roles: ["admin", "teacher", "student", "parent", "staff"],
  },
  {
    name: "Murid",
    path: "/list/students",
    roles: ["admin", "teacher", "staff"],
  },
  { name: "Mata Pelajaran", path: "/list/subjects", roles: ["admin", "staff"] },
  {
    name: "Guru",
    path: "/list/teachers",
    roles: ["admin", "teacher", "staff"],
  },
];

export default function SearchBar({ role }: { role: string }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const rolePages = allPages.filter((p) => p.roles.includes(role));

  // filter results
  const filtered = rolePages.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="relative w-full max-w-md">
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Cari Halaman..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 bg-transparent outline-none"
        />
      </div>

      {query && (
        <ul className="absolute z-10 w-full bg-white shadow-lg rounded-lg mt-1 max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((page) => (
              <li
                key={page.path}
                onClick={() => router.push(page.path)}
                className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                <span>{page.name}</span>
                <FaArrowRight className="text-gray-400 text-lg" />
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">No results</li>
          )}
        </ul>
      )}
    </div>
  );
}
