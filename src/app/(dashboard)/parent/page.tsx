import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";
import "react-big-calendar/lib/css/react-big-calendar.css";

const ParentPage = async () => {
  const { userId } = await getCurrentUser();

  const students = await prisma.student.findMany({
    where: {
      parentId: userId!,
    },
  });
  return (
    <div className="p-4 flex flex-1 gap-4 flex-col xl:flex-row">
      {/* left */}
      <div className="w-full xl:w-2/3flex-col">
        {students.map((student) => (
          <div className="" key={student.id}>
            <div className="h-full bg-white p-4 rounded-md">
              <h1 className="text-xl font-semibold">
                Jadwal {student.name + " " + student.surname}
              </h1>
              <BigCalendarContainer type="classId" id={student.classId!} />
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements></Announcements>
      </div>
    </div>
  );
};

export default ParentPage;
