import prisma from "@/lib/prisma";

const StudentAttendanceCard = async ({ id }: { id: string }) => {
  // Fetch all attendances for the student with meeting info
  const attendances = await prisma.attendance.findMany({
    where: {
      studentId: id,
      meeting: {
        date: {
          gte: new Date(new Date().getFullYear(), 0, 1), // current year
        },
      },
    },
    select: {
      status: true,
    },
  });

  const totalMeetings = attendances.length;
  const hadirCount = attendances.filter((a) => a.status === "HADIR").length;

  const percentage =
    totalMeetings > 0 ? Math.round((hadirCount / totalMeetings) * 100) : 0;

  return (
    <div className="">
      <h1 className="text-xl font-semibold">
        {totalMeetings > 0 ? `${percentage}%` : "-"}
      </h1>
      <span className="text-sm text-gray-400">Kehadiran</span>
    </div>
  );
};

export default StudentAttendanceCard;
