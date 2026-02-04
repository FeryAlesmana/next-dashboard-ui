import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalendar";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  function combineLocalDateTime(date: Date, time: string) {
    const [h, m] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0); // LOCAL TIME
    return d;
  }

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
    start: combineLocalDateTime(meeting.date, meeting.lesson.startTime),
    end: combineLocalDateTime(meeting.date, meeting.lesson.endTime),
  }));

  return (
    <div>
      <BigCalendar data={data} />
    </div>
  );
};

export default BigCalendarContainer;
