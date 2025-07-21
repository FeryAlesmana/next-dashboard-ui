import Link from "next/link";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton, UserButton } from "@clerk/nextjs";

const Menu = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata.role as string;
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
          label: "Teachers",
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
          label: "Students",
          href: "/list/students",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/parent.png",
          label: "Parents",
          href: "/list/parents",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/subject.png",
          label: "Subjects",
          href: "/list/subjects",
          visible: ["admin"],
        },
        {
          icon: "/class.png",
          label: "Classes",
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
          label: "Exams",
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
          label: "Profile",
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
            if (item.visible.includes(role)) {
              // Override profile href dynamically
              const href = item.label === "Profile" ? profileHref : item.href;
              if (item.action === "logout") {
                return (
                  <SignOutButton key={item.label}>
                    <button className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 rounded-md md:px-2 hover:bg-lamaSkyLight">
                      <Image src={item.icon} alt="" width={20} height={20} />
                      <span className="hidden lg:block">{item.label}</span>
                    </button>
                  </SignOutButton>
                );
              }
              return (
                <Link
                  href={href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 rounded-md md:px-2 hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20}></Image>
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
