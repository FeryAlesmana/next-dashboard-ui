import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import "react-big-calendar/lib/css/react-big-calendar.css";

const ParentPage = async ({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const sp = await searchParams; // resolve the Promise
  const normalized: { [k: string]: string | undefined } = {};
  Object.entries(sp ?? {}).forEach(([k, v]) => {
    normalized[k] = Array.isArray(v) ? v[0] : v;
  });
  const { userId } = await getCurrentUser();

  const parent = await prisma.parent.findUnique({
    where: { clerkId: userId! },
    select: {
      students: {
        select: {
          id: true,
          name: true,
          classId: true,
          createdAt: true,
          class: {
            select: {
              name: true,
              grade: { select: { level: true } },
            },
          },
        },
      },
      secondaryStudents: {
        select: {
          id: true,
          name: true,
          classId: true,
          createdAt: true,
          class: {
            select: {
              name: true,
              grade: { select: { level: true } },
            },
          },
        },
      },
      guardianStudents: {
        select: {
          id: true,
          name: true,
          classId: true,
          createdAt: true,
          class: {
            select: {
              name: true,
              grade: { select: { level: true } },
            },
          },
        },
      },
    },
  });

  const students = [
    ...(parent?.students ?? []),
    ...(parent?.secondaryStudents ?? []),
    ...(parent?.guardianStudents ?? []),
  ];
  return (
    <div className="p-4 flex flex-1 gap-4 flex-col xl:flex-row">
      {/* left */}
      <div className="w-full xl:w-2/3 flex-col ">
        {students.map((student) => (
          <div className="mb-8" key={student.id}>
            <div className="h-full bg-white p-4 rounded-md">
              <div className="flex flex-col gap-2">
                {/* Name + More button inline */}
                <div className="flex flex-row justify-between items-center">
                  <h2
                    className="text-xl font-semibold max-w-[200px] xl:max-w-none truncate"
                    title={student.name}
                  >
                    {/* Desktop: Jadwal Name */}
                    <span className="hidden xl:inline">
                      Jadwal {student.name}
                    </span>

                    {/* Mobile: only Name */}
                    <span className="xl:hidden">{student.name}</span>
                  </h2>

                  <Link href={`/list/students/${student.id}`}>
                    <Image
                      src="/morev.png"
                      alt=""
                      width={35}
                      height={35}
                      className="hover:bg-lamaPurple rounded-full p-2"
                    />
                  </Link>
                </div>

                {/* Class always below the name */}
                <p className="text-sm text-gray-600">
                  Kelas {student.class?.name || "-"}
                </p>
              </div>

              <div className="bg-white p-2 rounded-md flex-1 mr-7 md:m-0 mt-0 w-0 min-w-full">
                <div className="w-full overflow-hidden">
                  {/* 3. The scrollable area */}
                  <div className="overflow-x-auto">
                    {/* 4. The stubborn wide element */}
                    <div className="min-w-[823px]">
                      <div className="h-full bg-white p-4 rounded-md">
                        <BigCalendarContainer
                          type="classId"
                          id={student.classId!}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={normalized} />
        <Announcements></Announcements>
      </div>
    </div>
  );
};

export default ParentPage;
