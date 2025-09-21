import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  buildStudentLessonAttendance,
  getCurrentUser,
  normalizeSearchParams,
} from "@/lib/utils";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/setting";
import FormContainer from "@/components/FormContainer";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import AttendanceMeetingCard from "@/components/AttendanceMeetingCard";
import React from "react";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ClientPageWrapper from "@/components/ClientWrapper";
import StudentLessonChart from "@/components/StudentLessonChart";

interface AttendanceDetailPageProps {
  params: Promise<{
    className: string;
    lessonId: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AttendanceDetailPage({
  params,
  searchParams,
}: AttendanceDetailPageProps) {
  const { userId, role } = await getCurrentUser();
  const sp = await normalizeSearchParams(searchParams);
  const key = new URLSearchParams(
    Object.entries(sp).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  const { page, ...queryParams } = sp;
  const p = page ? parseInt(page) : 1;
  const columns = [
    {
      header: "Pertemuan",
      accessor: "meetingNo",
    },
    {
      header: "Tanggal",
      accessor: "date",
    },
    {
      header: "Jam Mulai",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "Jam Selesai",
      accessor: "endTime",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Aksi",
            accessor: "action",
          },
        ]
      : []),
  ];

  let parentChildrenIds: string[] = []; // Declare outside

  if (role === "parent") {
    const parent = await prisma.parent.findUnique({
      where: { id: userId! },
      include: {
        students: true,
        secondaryStudents: true,
        guardianStudents: true,
      },
    });

    const allChildren = [
      ...(parent?.students ?? []),
      ...(parent?.secondaryStudents ?? []),
      ...(parent?.guardianStudents ?? []),
    ];

    if (!parent || allChildren.length === 0) return notFound();

    parentChildrenIds = allChildren.map((s) => s.id); // Set the value
  }

  const { className, lessonId } = await params;
  const renderRow = (item: any) => {
    const studentAttendance = item.attendances.find(
      (att: any) => att.studentId === userId
    );
    const classStudentIds =
      item.lesson.class?.students?.map((s: any) => s.id) || [];
    console.log("attendances:", JSON.stringify(item, null, 2));

    const relevantStudentIds = parentChildrenIds.filter((id) =>
      classStudentIds.includes(id)
    );
    const parentChildrenAttendances = relevantStudentIds.map((studentId) => {
      const attendance = item.attendances.find(
        (att: any) => att.student?.id === studentId
      );

      const student = item.lesson.class.students.find(
        (s: any) => s.id === studentId
      );

      return {
        student,
        attendance,
      };
    });

    return (
      <React.Fragment key={item.id}>
        {/* Main Meeting Row */}
        <tr className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
          <td className="flex items-center p-4 gap-4">{item.meetingNo}</td>
          <td>
            {item.date
              ? new Intl.DateTimeFormat("id-ID").format(new Date(item.date))
              : "-"}
          </td>
          <td className="hidden md:table-cell">
            {item.startTime
              ? new Date(item.startTime).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"}
          </td>
          <td className="hidden md:table-cell">
            {item.endTime
              ? new Date(item.endTime).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"}
          </td>
          <td>
            {role === "teacher" || role === "admin" ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/list/attendance/${className}/${lessonId}/${item.id}`}
                >
                  <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                    <Image src="/view.png" alt="" width={16} height={16} />
                  </button>
                </Link>
                <FormContainer table="attendance" type="delete" id={item.id} />
              </div>
            ) : (
              []
            )}
          </td>
        </tr>

        {/* Attendance Status Row (only for student) */}
        {role === "student" && (
          <tr className="bg-gray-50">
            <td colSpan={5} className="p-2">
              <AttendanceMeetingCard
                attendance={
                  studentAttendance
                    ? {
                        status: studentAttendance.status,
                        date: studentAttendance.date,
                      }
                    : undefined
                }
              />
            </td>
          </tr>
        )}

        {/* Parent rows */}
        {role === "parent" &&
          parentChildrenAttendances.length > 0 &&
          parentChildrenAttendances.map(({ student, attendance }) => (
            <tr key={student.id} className="bg-gray-50">
              <td colSpan={5} className="p-2">
                <AttendanceMeetingCard
                  student={{ name: student?.name || "Tidak diketahui" }}
                  attendance={
                    attendance
                      ? {
                          status: attendance.status,
                          date: attendance.date,
                        }
                      : undefined
                  }
                />
              </td>
            </tr>
          ))}
      </React.Fragment>
    );
  };
  const lessonIdNumber = Number(lessonId);

  const idLesson = lessonId.toString();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonIdNumber },
    include: { subject: true, class: true, teacher: true },
  });
  if (!lesson) return notFound();
  const query: Prisma.MeetingWhereInput = { lessonId: lessonIdNumber };

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined)
        switch (key) {
          case "search":
            const searchValue = String(queryParams.search).trim();
            if (searchValue) {
              // Allow searching by meetingNo or date
              if (!isNaN(Number(searchValue))) {
                query.meetingNo = Number(searchValue);
              } else {
                query.date = { equals: new Date(searchValue) };
              }
            }
            break;
          case "id":
            query.id = { equals: parseInt(value) };
          default:
            break;
        }
    }
  }
  // ✅ Await it once

  // Build meeting query with lessonId and search

  const [data, count, classData, totalMeetings, attendanceStats] =
    await prisma.$transaction([
      prisma.meeting.findMany({
        orderBy: {
          meetingNo: "asc",
        },
        where: query,
        include: {
          attendances: {
            include: { student: true },
          },
          lesson: {
            include: {
              class: {
                include: {
                  students: true,
                },
              },
            },
          },
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.meeting.count({ where: query }),
      prisma.class.findUnique({
        where: { name: className },
        select: { id: true },
      }),
      prisma.meeting.count({ where: { lessonId: lessonIdNumber } }),

      // ✅ Group attendance by student + status
      prisma.attendance.groupBy({
        by: ["studentId", "status"],
        where: { lessonId: lessonIdNumber },
        _count: { _all: true },
        orderBy: {
          studentId: "asc", // 👈 add this if TypeScript complains
        },
      }),
    ]);
  const chartData = attendanceStats.reduce((acc, item) => {
    const studentId = item.studentId!;
    if (!acc[studentId]) {
      acc[studentId] = { HADIR: 0, SAKIT: 0, ABSEN: 0 };
    }

    // ✅ count comes from _all, since you grouped by status
    acc[studentId][item.status] = (item._count as { _all: number })._all;

    return acc;
  }, {} as Record<string, { HADIR: number; SAKIT: number; ABSEN: number }>);

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">
            <Link href={`/list/attendance/${className}/${lessonId}`}>
              <span className="hidden md:inline">Daftar Pertemuan - </span>
              {lesson?.subject?.name ?? "-"} ({lesson?.class?.name ?? "-"})
            </Link>
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="" width={14} height={14} />
              </button> */}
              {role === "admin" && (
                <FormContainer
                  table="attendance"
                  type="create"
                  lessonId={idLesson!}
                ></FormContainer>
              )}
            </div>
          </div>
        </div>
        {/* TABLE LIST */}
        <div>
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
        {/* PAGINATION */}
        <div>
          <Pagination page={p} count={count} />
        </div>
      </div>
      {role === "parent" &&
        parentChildrenIds
          .filter((id) =>
            data[0]?.lesson?.class?.students.some((s: any) => s.id === id)
          )
          .map((studentId) => {
            const student = data[0]?.lesson?.class?.students.find(
              (s: any) => s.id === studentId
            );

            const studentStats = chartData[studentId] || {
              HADIR: 0,
              SAKIT: 0,
              ABSEN: 0,
            };
            const chartArray = Object.entries(studentStats).map(
              ([status, count]) => ({
                status,
                count,
              })
            );
            return (
              <div key={studentId} className="my-6 p-4 bg-white rounded shadow">
                <h2 className="text-lg font-semibold mb-2">
                  Kehadiran {student?.name || "Tidak diketahui"} (Total{" "}
                  {totalMeetings} pertemuan)
                </h2>
                <StudentLessonChart data={chartArray} />
              </div>
            );
          })}

      {/* Calendar */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[823px]">
          <div className="h-full bg-white p-4 rounded-md">
            <h1 className="text-xl font-semibold">Jadwal ({className})</h1>
            {classData?.id && (
              <BigCalendarContainer type="classId" id={classData.id} />
            )}
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
