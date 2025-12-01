"use client";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MenuSkeleton from "./MenuSkeleton";
import { useState } from "react";
type SidebarChildItem = {
  label: string;
  href: string;
};

type SidebarAction = "logout" | "toggle" | "openModal";

type SidebarItem =
  | {
      icon: string;
      label: string;
      visible: string[];
      href: string;
      action?: undefined;
      children?: undefined;
    }
  | {
      icon: string;
      label: string;
      visible: string[];
      children: SidebarChildItem[];
      href?: undefined;
      action?: undefined;
    }
  | {
      icon: string;
      label: string;
      visible: string[];
      action: SidebarAction;
      href?: undefined;
      children?: undefined;
    };

type SidebarGroup = {
  title: string;
  items: SidebarItem[];
};
export default function Menu({ onLinkClick }: { onLinkClick: () => void }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (label: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };
  const role = user?.publicMetadata?.role as string | undefined;
  const userId = user?.id;

  if (!isLoaded) return <MenuSkeleton />;
  const menuItems: SidebarGroup[] = [
    {
      title: "MENU",
      items: [
        {
          icon: "/home.png",
          label: "Home",
          href: "/",
          visible: ["admin", "teacher", "student", "parent", "staff"],
        },
        {
          icon: "/dashboard.png",
          label: "Beranda",
          href: `/${role}`,
          visible: ["admin", "teacher", "student", "parent", "staff"],
        },
        {
          icon: "/teacher.png",
          label: "Guru",
          href: "/list/teachers",
          visible: ["admin", "teacher", "staff"],
        },
        {
          icon: "/staff.png",
          label: "Staff",
          href: "/list/staffs",
          visible: ["admin", "teacher", "staff"],
        },
        {
          icon: "/lesson.png",
          label: "PPDB",
          href: "/list/ppdb",
          visible: ["admin", "staff"],
        },
        {
          icon: "/student.png",
          label: "Murid",
          href: "/list/students",
          visible: ["admin", "teacher", "staff"],
        },
        {
          icon: "/parent.png",
          label: "Wali Murid",
          href: "/list/parents",
          visible: ["admin", "teacher", "staff"],
        },
        {
          icon: "/subject.png",
          label: "Mata Pelajaran",
          href: "/list/subjects",
          visible: ["admin", "staff"],
        },
        {
          icon: "/class.png",
          label: "Kelas",
          href: "/list/classes",
          visible: ["admin", "teacher", "staff"],
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
          visible: ["admin", "teacher", "student", "parent", "staff"],
        },
        {
          icon: "/assignment.png",
          label: "Tugas",
          href: "/list/assignments",
          visible: ["admin", "teacher", "student", "parent", "staff"],
        },
        {
          icon: "/result.png",
          label: "Nilai",
          href: "/list/results",
          visible: ["admin", "teacher", "student", "parent", "staff"],
        },
        {
          icon: "/finance.png",
          label: "Pembayaran",
          visible: ["admin"],
          children: [
            {
              label: "Riwayat Pembayaran",
              href: "/list/payment",
            },
            {
              label: "Changelog",
              href: "/list/payment/changelog",
            },
          ],
        },
        {
          icon: "/finance.png",
          label: "Pembayaran",
          visible: ["student", "parent", "staff"], // still allowed
          href: "/list/payment",
        },
        {
          icon: "/calendar.png",
          label: "Events",
          href: "/list/events",
          visible: ["admin", "teacher", "student", "parent", "staff"],
        },
        {
          icon: "/profile.png",
          label: "User",
          href: "/list/users",
          visible: ["admin"],
        },
        {
          icon: "/announcement.png",
          label: "Pemberitahuan",
          href: "/list/announcements",
          visible: ["admin", "teacher", "student", "parent", "staff"],
        },
      ],
    },
    {
      title: "LAINNYA",
      items: [
        {
          icon: "/profile.png",
          label: "Profil",
          href: "",
          visible: ["teacher", "student", "staff"],
        },
        {
          icon: "/setting.png",
          label: "Settings",
          href: "/settings",
          visible: ["admin"],
        },
        {
          icon: "/logout.png",
          label: "Logout",
          visible: ["admin", "teacher", "student", "parent", "staff"],
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
      : `/${role}`; // fallback for other roles

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((group) => (
        <div className="flex flex-col gap-2" key={group.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {group.title}
          </span>

          {group.items.map((item) => {
            if (!item.visible.includes(role!)) return null;

            const isExpandable = Array.isArray(item.children);

            if (isExpandable) {
              const isOpen = openItems[item.label] ?? false;

              // Parent active if any child is active
              const parentActive = item.children?.some((child) =>
                pathname?.startsWith(child.href)
              );

              return (
                <div key={item.label} className="transition-all">
                  {/* Parent Item */}
                  <button
                    className={`flex justify-between items-center w-full py-2 md:px-2 rounded-md transition-all duration-200
          ${
            parentActive
              ? "bg-lamaSkyLight font-medium text-black"
              : "text-gray-500 hover:bg-lamaSkyLight"
          }
        `}
                    onClick={() => toggleItem(item.label)}
                  >
                    <span className="flex items-center gap-4">
                      <Image src={item.icon} width={20} height={20} alt="" />
                      {item.label}
                    </span>
                    <span
                      className={`text-xs transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  {/* Children container with smooth slide animation */}
                  <div
                    className={`ml-6 pl-4 border-l border-gray-300 overflow-hidden transition-all duration-300 ease-in-out
        ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
      `}
                  >
                    <div className="mt-1 flex flex-col gap-1">
                      {item.children?.map((child) => {
                        const isActive = pathname === child.href;

                        return (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => onLinkClick?.()}
                            className={`py-1 px-2 rounded-md relative transition-all duration-200
                  ${
                    isActive
                      ? "bg-lamaSkyLight font-medium text-black"
                      : "text-gray-600 hover:bg-lamaSkyLight"
                  }
                `}
                          >
                            {/* Branch bullet */}
                            <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></span>
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Normal item without children
            if (item.action === "logout") {
              return (
                <SignOutButton key={item.label}>
                  <button className="flex gap-4 text-gray-500 py-2 md:px-2 hover:bg-lamaSkyLight rounded-md">
                    <Image src={item.icon} width={20} height={20} alt="" />
                    {item.label}
                  </button>
                </SignOutButton>
              );
            }

            const href = item.label === "Profil" ? profileHref : item.href;
            const isActive =
              href === "/" ? pathname === "/" : pathname?.startsWith(href!);

            return (
              <Link
                key={item.label}
                href={href!}
                onClick={() => onLinkClick?.()}
                className={`flex gap-4 py-2 md:px-2 rounded-md ${
                  isActive
                    ? "bg-lamaSkyLight font-medium text-black"
                    : "text-gray-500 hover:bg-lamaSkyLight"
                }`}
              >
                <Image src={item.icon} width={20} height={20} alt="" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
