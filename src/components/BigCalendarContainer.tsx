import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalendar";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const meetings = await prisma.meeting.findMany({
    where: {
      lesson: {
        ...(type === "teacherId"
          ? { teacherId: id as string }
          : { classId: id as number }),
      },
    },
    include: {
      lesson: true, // Needed to access lesson.name
    },
  });

  const data = meetings.map((meeting) => ({
    title: meeting.lesson?.name
      ? `Pertemuan ${meeting.meetingNo} - ${meeting.lesson.name}`
      : `Pertemuan ${meeting.meetingNo}`,
    start: meeting.startTime,
    end: meeting.endTime,
  }));

  return (
    <div>
      <BigCalendar data={data} />
    </div>
  );
};

export default BigCalendarContainer;
