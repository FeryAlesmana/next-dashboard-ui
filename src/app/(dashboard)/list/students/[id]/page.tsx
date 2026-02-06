import Announcements from "@/components/Announcements";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Image from "next/image";
import Link from "next/link";
import Perfomance from "@/components/Perfomance";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { decryptPassword, getCurrentUser } from "@/lib/utils";
import { Class, Student, student_details } from "@prisma/client";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EmailCopy from "@/components/EmailCopy";
import { Suspense } from "react";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import FormContainer from "@/components/FormContainer";
import ForbiddenPage from "@/components/Forbidden";
import { Semester } from "@/components/client/StudentPaymentView";
import StudentLessonChart from "@/components/StudentLessonChart";

const SingleStudentPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { userId, role } = await getCurrentUser();

  // Block users from viewing others' profiles unless they are admin
  if (!role) {
    return notFound(); // Block completely unknown users
  }

  // ✅ If the role is 'student' but trying to access another student's page

  const student:
    | (Student & {
        class: (Class & { _count: { lessons: number } }) | null;
        grade: { id: number; level: number } | null;
        student_details: student_details | null;
      })
    | null = await prisma.student.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          _count: {
            select: { lessons: true },
          },
        },
      },
      grade: { select: { id: true, level: true } },
      student_details: true,
    },
  });

  if (role === "student" && student?.clerkId !== userId) {
    return <ForbiddenPage />; // Prevent access
  }

  let studentWithDecryptedPassword = {
    ...student,
    password: student?.password ? decryptPassword(student.password) : "",
  };
  const generateSemesters = (
    createdAt: Date,
    gradeLevel: number,
  ): Semester[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    // 1. Determine the start of the current Academic Year
    // If we are in Jan-June (0-5), the school year started last year
    const academicYearStart = currentMonth < 6 ? currentYear - 1 : currentYear;

    // 2. Calculate when the student actually started Grade 1
    // If they are in Grade 3 now, they started Grade 1 two years ago
    const studentEntryYear = academicYearStart - (gradeLevel - 1);

    const generated: Semester[] = [];

    // 3. Loop from Entry Year up to the Current Academic Year
    for (let year = studentEntryYear; year <= academicYearStart; year++) {
      // Semester Ganjil (July - Dec)
      generated.push({
        label: `Ganjil ${year}/${year + 1}`,
        start: new Date(`${year}-07-01`),
        end: new Date(`${year}-12-31`),
      });

      // Semester Genap (Jan - June)
      // Only add Genap if the year has actually reached that point
      // Or if it's a past year
      if (year < academicYearStart || currentMonth < 6) {
        generated.push({
          label: `Genap ${year}/${year + 1}`,
          start: new Date(`${year + 1}-01-01`),
          end: new Date(`${year + 1}-06-30`),
        });
      }
    }

    // Filter out semesters that start in the future relative to "now"
    return generated.filter((sem) => sem.start <= now).reverse();
  };

  const semesters = generateSemesters(
    student ? student.createdAt : new Date(),
    student?.grade?.level!,
  );
  const now = new Date();
  const currentSemester = semesters.find((s) => now >= s.start && now <= s.end);

  const attendanceStats = await prisma.attendance.groupBy({
    by: ["status"],
    where: {
      studentId: String(id), // 👈 only this student
      date: {
        gte: currentSemester?.start,
        lte: currentSemester?.end,
      },
    },
    _count: { _all: true },
  });

  const baseStats = { HADIR: 0, SAKIT: 0, ABSEN: 0, IZIN: 0 };

  const stats = attendanceStats.reduce((acc, item) => {
    acc[item.status] = item._count._all;
    return acc;
  }, baseStats);

  // turn into array for recharts
  const chartArray = Object.entries(stats).map(([status, count]) => ({
    status,
    count,
  }));

  if (!student) {
    return notFound();
  }
  const classId = student.class?.id;
  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row flex-1">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-8">
        {/* TOP */}
        <div className=" flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-xl flex-1 flex flex-col items-center lg:flex-row lg:items-start lg:gap-4">
            <div className="w-full lg:w-1/3 flex justify-center mb-4 lg:mb-0">
              <Image
                src={student.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-32 h-32 md:w-48 md:h-48 xl:w-52 xl:h-52 rounded-full object-cover"
              ></Image>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                {/* 1. Group Name and NISN together in a column */}
                <div className="flex flex-col">
                  <h1 className="text-xl font-semibold max-w-full md:max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {student.name}
                  </h1>

                  {/* NISN is now naturally below the H1 */}
                  <span className="text-sm font-medium text-gray-500">
                    NISN: {student.student_details?.nisn}
                  </span>
                </div>

                {role === "admin" && (
                  <FormContainer
                    table="student"
                    type="update"
                    data={studentWithDecryptedPassword}
                  />
                )}
              </div>

              <p className="text-sm text-gray-500">
                {student.address}
                {student.rt && student.rw
                  ? `, RT ${student.rt}/RW ${student.rw}`
                  : ""}
                {student.kelurahan ? `, Kel. ${student.kelurahan}` : ""}
                {student.kecamatan ? `, Kec. ${student.kecamatan}` : ""}
                {student.kota ? `, ${student.kota}` : ""}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14}></Image>
                  <span>
                    {new Intl.DateTimeFormat("en-UK").format(student.birthday)}
                  </span>
                </div>
                <EmailCopy email={student.email} />
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14}></Image>
                  <span>{student.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            <div className="w-full bg-white p-4 rounded-md flex gap-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                height={24}
                width={24}
                className="w-6 h-6"
              ></Image>
              <Suspense fallback="Loading...">
                <StudentAttendanceCard id={student.id}></StudentAttendanceCard>
              </Suspense>
            </div>
            {/* CARD */}
            <div className="w-full bg-white p-4 rounded-md flex gap-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                height={24}
                width={24}
                className="w-6 h-6"
              ></Image>
              <div className="">
                <h1 className="text-xl font-semibold">
                  {student.class?.name.charAt(0) || "-"}
                </h1>
                <span className="text-sm text-gray-400">Tingkat</span>
              </div>
            </div>
            {/* CARD */}
            <div className="w-full bg-white p-4 rounded-md flex gap-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleLesson.png"
                alt=""
                height={24}
                width={24}
                className="w-6 h-6"
              ></Image>
              <div className="">
                <h1 className="text-xl font-semibold">
                  {student.class?._count.lessons || "-"}
                </h1>
                <span className="text-sm text-gray-400">Mata Pelajaran</span>
              </div>
            </div>
            {/* CARD */}
            <div className="w-full bg-white p-4 rounded-md flex gap-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                height={24}
                width={24}
                className="w-6 h-6"
              ></Image>
              <div className="">
                <h1 className="text-xl font-semibold">
                  {student.class?.name || "-"}
                </h1>
                <span className="text-sm text-gray-400"> Kelas</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="bg-white p-2 rounded-md flex-1 mr-7 md:m-0 mt-0 w-0 min-w-full">
          <div className="w-full overflow-hidden">
            {/* 3. The scrollable area */}
            <div className="overflow-x-auto">
              {/* 4. The stubborn wide element */}
              <div className="min-w-[823px]">
                <div className="h-full bg-white p-4 rounded-md">
                  <h1 className="text-xl font-semibold">
                    Jadwal ({student.class?.name || "-"})
                  </h1>
                  {classId && (
                    <BigCalendarContainer type="classId" id={classId} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/lessons?classId=${classId}`}
            >
              Mata Pelajaran
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/teachers?classId=${classId}`}
            >
              Guru murid
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50"
              href={`/list/exams?classId=${classId}`}
            >
              Ujian
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/assignments?classId=${classId}`}
            >
              Tugas
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight"
              href={`/list/results/${student.id}`}
            >
              Hasil
            </Link>
          </div>
        </div>
        <div className="my-6 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-2">
            Kehadiran (Semester {currentSemester?.label || "-"})
          </h2>
          <StudentLessonChart data={chartArray} />
        </div>

        <Announcements></Announcements>
      </div>
    </div>
  );
};

export default SingleStudentPage;
