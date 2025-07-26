"use client";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Menu() {
  const { user } = useUser();
  const pathname = usePathname();
  const role = user?.publicMetadata?.role as string | undefined;
  const userId = user?.id;
  const menuItems = [
    {
      title: "MENU",
      items: [
        {
          icon: "/home.png",
          label: "Home",
          href: "/",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/dashboard.png",
          label: "Beranda",
          href: `/${role}`,
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/teacher.png",
          label: "Guru",
          href: "/list/teachers",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/lesson.png",
          label: "PPDB",
          href: "/list/ppdb",
          visible: ["admin"],
        },
        {
          icon: "/student.png",
          label: "Murid",
          href: "/list/students",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/parent.png",
          label: "Orang Tua",
          href: "/list/parents",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/subject.png",
          label: "Mata Pelajaran",
          href: "/list/subjects",
          visible: ["admin"],
        },
        {
          icon: "/class.png",
          label: "Kelas",
          href: "/list/classes",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/jadwal.png",
          label: "Jadwal",
          href: "/list/lessons",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/exam.png",
          label: "Ujian",
          href: "/list/exams",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/assignment.png",
          label: "Tugas",
          href: "/list/assignments",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/result.png",
          label: "Nilai",
          href: "/list/results",
          visible: ["admin", "teacher", "student", "parent"],
        },
        // {
        //   icon: "/attendance.png",
        //   label: "Kehadiran",
        //   href: "/list/attendance",
        //   visible: ["admin", "teacher", "student", "parent"],
        // },
        {
          icon: "/calendar.png",
          label: "Events",
          href: "/list/events",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/message.png",
          label: "Pesan",
          href: "/list/messages",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/announcement.png",
          label: "Pemberitahuan",
          href: "/list/announcements",
          visible: ["admin", "teacher", "student", "parent"],
        },
      ],
    },
    {
      title: "OTHER",
      items: [
        {
          icon: "/profile.png",
          label: "Profil",
          href: "",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/setting.png",
          label: "Settings",
          href: "/settings",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/logout.png",
          label: "Logout",
          href: "",
          visible: ["admin", "teacher", "student", "parent"],
          action: "logout",
        },
      ],
    },
  ];
  const profileHref =
    role === "student"
      ? `/list/students/${userId}`
      : role === "teacher"
      ? `/list/teachers/${userId}`
      : "/profile"; // fallback for other roles

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (typeof role === "string" && item.visible.includes(role)) {
              // Override profile href dynamically
              const href = item.label === "Profil" ? profileHref : item.href;
              const isActive =
                href === "/" ? pathname === "/" : pathname?.startsWith(href);
              if (item.action === "logout") {
                return (
                  <SignOutButton key={item.label}>
                    <button className="flex lg:justify-start gap-4 text-gray-500 py-2 rounded-md md:px-2 hover:bg-lamaSkyLight">
                      <Image src={item.icon} alt="" width={20} height={20} />
                      <span className="inline">{item.label}</span>
                    </button>
                  </SignOutButton>
                );
              }
              return (
                <Link
                  href={href}
                  key={item.label}
                  className={`flex lg:justify-start gap-4 py-2 rounded-md md:px-2 
              ${
                isActive
                  ? "bg-lamaSkyLight font-medium text-lamaSky"
                  : "text-gray-500 hover:bg-lamaSkyLight"
              }`}
                >
                  <Image src={item.icon} alt="" width={20} height={20}></Image>
                  <span className="inline">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
}
