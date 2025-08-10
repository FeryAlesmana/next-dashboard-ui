import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import "react-big-calendar/lib/css/react-big-calendar.css";

const ParentPage = async () => {
  const { userId } = await getCurrentUser();

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { parentId: userId! },
        { secondParentId: userId! },
        { guardianId: userId! },
      ],
    },
  });
  return (
    <div className="p-4 flex flex-1 gap-4 flex-col xl:flex-row">
      {/* left */}
      <div className="w-full xl:w-2/3flex-col">
        {students.map((student) => (
          <div className="" key={student.id}>
            <div className="h-full bg-white p-4 rounded-md">
              <div className="flex flex-row justify-between">
                <h2 className="text-xl font-semibold mb-4">
                  Jadwal {student.name}
                </h2>
                <Link href={`/list/students/${student.id}`}>
                  <Image
                    src="/moreDark.png"
                    alt=""
                    width={35}
                    height={35}
                    className="text-right hover:bg-lamaPurple rounded-full p-2 "
                  />
                </Link>
              </div>
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
