import AttendanceMeetingCard from "@/components/AttendanceMeetingCard";
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";
import { notFound } from "next/navigation";

interface MeetingAttendancePageProps {
  params: Promise<{
    className: string;
    lessonId: string;
    meetingId: string;
  }>;
}

export default async function MeetingAttendancePage({
  params,
}: MeetingAttendancePageProps) {
  const { userId, role } = await getCurrentUser();
  const { className, lessonId, meetingId } = await params;
  if (!className || !lessonId || !meetingId) {
    return notFound();
  }
  const idMeeting = Number(meetingId);

  const meeting = await prisma.meeting.findUnique({
    where: { id: idMeeting },
    include: {
      lesson: {
        include: { class: { include: { students: true } }, subject: true },
      },
      attendances: true,
    },
  });

  if (!meeting) return notFound();

  // Attendance lookup
  const attendanceMap = new Map(
    meeting.attendances.map((a) => [a.studentId, a])
  );

  // Teacher view: show all students
  if (role === "teacher" || role === "admin") {
    const students = meeting.lesson.class?.students ?? [];

    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">
          Presensi {meeting.lesson.subject?.name} - {meeting.lesson.class?.name}{" "}
          (Pertemuan {meeting.meetingNo})
        </h1>
        <FormContainer
          table="attendance"
          type="update"
          data={{
            lessonId: meeting.lessonId,
            meetingId: meetingId,
            attendance: Object.fromEntries(attendanceMap.entries()), // Pass full attendance map to the form
          }}
        />

        <div className="grid gap-4">
          {students.map((student) => {
            const att = attendanceMap.get(student.id);

            return (
              <div key={student.id} className="border rounded-lg p-4">
                <div className="font-semibold text-lg mb-2">{student.name}</div>
                <AttendanceMeetingCard
                  key={student.id}
                  meeting={{
                    meetingNo: meeting.meetingNo,
                    date: meeting.date,
                    startTime: meeting.startTime,
                    endTime: meeting.endTime,
                  }}
                  attendance={
                    att
                      ? {
                          status: att.status, // Instead of present: boolean
                          date: att.date,
                        }
                      : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Student view: show only their own attendance
  if (role === "student") {
    const studentAttendance = meeting.attendances.find(
      (att) => att.studentId === userId
    );

    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">
          Status Presensi Anda - Pertemuan {meeting.meetingNo}
        </h1>

        <AttendanceMeetingCard
          meeting={{
            meetingNo: meeting.meetingNo,
            date: meeting.date,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
          }}
          attendance={
            studentAttendance
              ? {
                  status: studentAttendance.status, // Instead of present: boolean
                  date: studentAttendance.date,
                }
              : undefined
          }
        />
      </div>
    );
  }

  // if (role === "parent") {
  //   const children = await prisma.student.findMany({
  //     where: {
  //       OR: [
  //         { parentId: userId! },
  //         { secondParentId: userId! },
  //         { guardianId: userId! },
  //       ],
  //     },
  //   });

  //   if (!children.length) {
  //     return (
  //       <div className="p-6 text-center text-gray-500">
  //         Anda belum terdaftar sebagai wali dari siswa manapun.
  //       </div>
  //     );
  //   }

  //   const childrenIds = children.map((c) => c.id);
  //   const relevantAttendances = meeting.attendances.filter((att) =>
  //     childrenIds.includes(att.studentId!)
  //   );

  //   return (
  //     <div className="p-6 space-y-6">
  //       <h1 className="text-2xl font-bold mb-4">
  //         Presensi Anak - Pertemuan {meeting.meetingNo}
  //       </h1>

  //       {children.map((child) => {
  //         const att = relevantAttendances.find((a) => a.studentId === child.id);

  //         return (
  //           <div key={child.id} className="border rounded-lg p-4">
  //             <div className="font-semibold text-lg mb-2">
  //               {child.name} (ID: {child.id})
  //             </div>
  //             <AttendanceMeetingCard
  //               meeting={{
  //                 meetingNo: meeting.meetingNo,
  //                 date: meeting.date,
  //                 startTime: meeting.startTime,
  //                 endTime: meeting.endTime,
  //               }}
  //               attendance={
  //                 att ? { status: att.status, date: att.date } : undefined
  //               }
  //             />
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // }

  return <div className="p-8 text-center text-red-500">Akses ditolak.</div>;
}
