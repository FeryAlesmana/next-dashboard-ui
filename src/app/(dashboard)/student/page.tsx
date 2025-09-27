import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import EventCalender from "@/components/EventCalender";
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

  const classItem = await prisma.class.findMany({
    where: {
      students: {
        some: {
          id: userId!,
        },
      },
    },
  });

  // console.log(classItem);

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* left */}
      <div className="w-full overflow-x-auto">
        <div className="h-full bg-white p-4 rounded-md min-w-[823px]">
          <h1 className="text-xl font-semibold">
            Jadwal ({classItem[0]?.name})
          </h1>
          <BigCalendarContainer type="classId" id={classItem[0]?.id} />
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
