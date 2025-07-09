import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import "react-big-calendar/lib/css/react-big-calendar.css";

const TeacherPage = async () => {
  const { userId } = await auth();
  const classItem = await prisma.class.findMany({
    where: {
      supervisorId: userId!,
    },
  });

  return (
    <div className="p-4 flex flex-1 gap-4 flex-col xl:flex-row">
      {/* left */}
      {/* <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Jadwal ({classItem[0].name})</h1>
          <BigCalendarContainer type="teacherId" id={userId!} />
        </div>
      </div> */}
      <div className="w-full xl:w-2/3flex-col">
        {classItem.map((teacher) => (
          <div className="" key={teacher.id}>
            <div className="h-full bg-white p-4 rounded-md">
              <h1 className="text-xl font-semibold">
                Jadwal Kelas {teacher.name}
              </h1>
              <BigCalendarContainer type="classId" id={teacher.id!} />
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

export default TeacherPage;
