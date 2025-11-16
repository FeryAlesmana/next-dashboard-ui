import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const Announcements = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const roleConditions = {
    teacher: {
      lessons: {
        some: {
          teacherId: userId!,
        },
      },
    },
    student: {
      students: {
        some: {
          id: userId!,
        },
      },
    },
    parent: {
      students: {
        some: {
          parentId: userId!,
        },
      },
    },
  };
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      date: {
        gte: oneMonthAgo,
        lte: today,
      },
      ...(role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });
  const cardColors = [
    "bg-lamaSkyLight",
    "bg-lamaPurpleLight",
    "bg-lamaYellowLight",
  ];

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pemberitahuan</h1>
        <Link href="/list/announcements">
          <span className="text-xs text-gray-400 hover:bg-gray-200 rounded-sm p-1">
            Lihat Semua
          </span>
        </Link>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data.length > 0 ? (
          data.map((announcement, index) => (
            <Link
              key={announcement.id}
              href={`/list/announcements/${announcement.id}`}
              className={`${
                cardColors[index % cardColors.length]
              } rounded-md p-4 block hover:opacity-90 transition`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{announcement.title}</h2>
                <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                  {new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                  }).format(announcement.date)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {announcement.description}
              </p>
            </Link>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-gray-500">
            Tidak ada Pemberitahuan dalam sebulan terakhir 📭
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
