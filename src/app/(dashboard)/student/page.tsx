import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import StudentAttendanceContainer from "@/components/AttendancePieCharContainer";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import EventCalender from "@/components/EventCalender";
import StudentFinanceContainer from "@/components/StudentFinanceContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import "react-big-calendar/lib/css/react-big-calendar.css";

const StudentPage = async ({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const sp = await searchParams; // resolve the Promise
  const normalized: { [k: string]: string | undefined } = {};
  Object.entries(sp ?? {}).forEach(([k, v]) => {
    normalized[k] = Array.isArray(v) ? v[0] : v;
  });
  const { userId } = await auth();

  await prisma.class.findFirst({
    where: {
      students: {
        some: {
          clerkId: userId!,
        },
      },
    },
  });
  const [student, classItem] = await prisma.$transaction([
    prisma.student.findUnique({
      where: { clerkId: userId! },
      select: { id: true, name: true },
    }),
    prisma.class.findFirst({
      where: {
        students: {
          some: {
            clerkId: userId!,
          },
        },
      },
    }),
  ]);

  const studentId = student?.id;

  // console.log(classItem);

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* left */}
      <div className="w-full xl:w-2/3 flex-col ">
        <div className="bg-white p-2 rounded-md flex-1 mr-7 md:m-0 mt-0 w-0 min-w-full">
          <div className="flex-1 min-w-0">
            <div className="bg-white p-4 rounded-md ">
              <h1 className="text-xl font-semibold mb-4">
                Jadwal ({classItem?.name!})
              </h1>

              {/* The Scrollable Wrapper */}
              <div className="w-full overflow-x-auto border rounded-md">
                <div className="min-w-[823px]">
                  <BigCalendarContainer type="classId" id={classItem?.id!} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/3 h-[450px] mt-2">
            <StudentAttendanceContainer id={studentId!} />
          </div>
          <div className="w-full lg:w-2/3 h-[450px] mt-2">
            <StudentFinanceContainer studentId={studentId!}/>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={normalized} />
        <Announcements></Announcements>
      </div>
    </div>
  );
};

export default StudentPage;
