import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";
import Link from "next/link";
import { CollapsibleImage } from "./ColapsibleImage";

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
  const date = dateParam ? new Date(dateParam) : new Date();
  // First day of the month
  const startOfMonth = new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  // Last day of the month
  const endOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const { role, userId } = await getCurrentUser();
  const query: any = {
    startTime: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
  };

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: {
      students: {
        some: {
          OR: [
            { parentId: userId! },
            { secondParentId: userId! },
            { guardianId: userId! },
          ],
        },
      },
    },
  };

  if (role !== "admin") {
    query.OR = [
      { classId: null },
      { class: roleConditions[role as keyof typeof roleConditions] || {} },
    ];
  }

  const data = await prisma.event.findMany({ where: query });

  if (data.length === 0) {
    return (
      <div className="p-5 mt-2 rounded-md border-2 border-gray-100 text-center text-gray-400">
        Tidak ada kegiatan Bulan ini
      </div>
    );
  }
  return data.map((event) => (
    <div
      className="p-5 mt-2 rounded-md border-2 border-gray-100 odd:border-t-lamaSky even:border-t-lamaPurple"
      key={event.id}
    >
      <Link key={event.id} href={`list/events/${event.id}`}>
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-gray-600">{event.title}</h1>
          <span className="text-xs text-gray-500 ">
            {event.startTime.toLocaleString("id-ID", {
              weekday: "short", // Mon, Tue
              day: "2-digit",
              month: "short", // Jan, Feb
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
        </div>
        <p className="text-gray-400 mt-2 text-sm">{event.description}</p>
      </Link>
      {event.img && <CollapsibleImage src={event.img} />}
    </div>
  ));
};

export default EventList;
