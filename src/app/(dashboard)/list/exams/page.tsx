import ClientPageWrapper from "@/components/ClientWrapper";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { Class, Exam, exTypes, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type ExamList = Exam & {
  lesson: { subject: Subject; class: Class; teacher: Teacher };
};

const ExamListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const sp = await normalizeSearchParams(searchParams);
  const { page, ...queryParams } = sp;
  const key = new URLSearchParams(
    Object.entries(sp).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  const p = page ? parseInt(page) : 1;

  const { role, userId } = await getCurrentUser();
  const columns = [
    {
      header: "Mata Pelajaran",
      accessor: "Nama",
    },
    {
      header: "Kelas",
      accessor: "kelas",
    },
    {
      header: "Guru",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Waktu Mulai",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "Waktu Selesai",
      accessor: "endTime",
      className: "hidden md:table-cell",
    },
    {
      header: "Ujian",
      accessor: "exType",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Aksi",
            accessor: "action",
          },
        ]
      : []),
  ];
  const examTypeLabel = {
    UJIAN_HARIAN: "Ujian Harian",
    UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
    UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
  } as const;
  const renderRow = (item: ExamList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center p-4 gap-4">
        {item.lesson.subject?.name || "-"}
      </td>
      <td>{item.lesson.class.name}</td>
      <td className="hidden md:table-cell">
        {item.lesson.teacher
          ? `${item.lesson.teacher.name} ${item.lesson.teacher.namalengkap}`
          : "Tidak ada guru"}
      </td>
      <td className="hidden md:table-cell">
        {" "}
        {item.startTime.toLocaleDateString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          day: "numeric",
          month: "numeric",
        })}
      </td>
      <td className="hidden md:table-cell">
        {" "}
        {item.endTime.toLocaleDateString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          day: "numeric",
          month: "numeric",
        })}
      </td>
      <td className="hidden md:table-cell">
        {item.exType ? examTypeLabel[item.exType] : "-"}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role == "teacher") && (
            <>
              <FormContainer
                table="exam"
                type="update"
                data={item}
              ></FormContainer>
              <FormContainer
                table="exam"
                type="delete"
                id={item.id}
              ></FormContainer>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const query: Prisma.ExamWhereInput = {};

  query.lesson = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined)
        switch (key) {
          case "teacherId":
            query.lesson.teacherId = value;
            break;
          case "classId":
            query.lesson.classId = parseInt(value);
            break;
          case "search":
            query.OR = [
              {
                lesson: {
                  subject: { name: { contains: value, mode: "insensitive" } },
                },
              },
              {
                lesson: {
                  teacher: { name: { contains: value, mode: "insensitive" } },
                },
              },
              {
                lesson: {
                  class: { name: { contains: value, mode: "insensitive" } },
                },
              },
            ];
            break;
          default:
            break;
        }
    }
  }

  // ROLE CONDITIONS
  let students: any[] = [];
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.lesson.teacherId = userId!;
      break;
    case "student":
      query.lesson.class = {
        students: {
          some: {
            id: userId!,
          },
        },
      };
      break;
    case "parent":
      const children = await prisma.student.findMany({
        where: {
          OR: [
            { parentId: userId! },
            { secondParentId: userId! },
            { guardianId: userId! },
          ],
        },
        select: { classId: true, name: true, id: true },
      });

      const classIds = children
        .map((child) => child.classId)
        .filter((id): id is number => id !== null && id !== undefined);

      if (classIds.length === 0) {
        return (
          <div className="p-8 text-center text-gray-500">
            Tidak ada data kelas anak Anda.
          </div>
        );
      }

      query.lesson.classId = { in: classIds };
      const studentsWithExams = await Promise.all(
        children.map(async (child) => {
          if (!child.classId)
            return { id: child.id, name: child.name, exams: [] };

          const lessons = await prisma.lesson.findMany({
            where: { classId: child.classId },
            include: {
              exams: true,
              subject: true,
              class: true,
              teacher: { select: { name: true, namalengkap: true } },
            },
          });

          const exams = lessons.flatMap((lesson) =>
            lesson.exams.map((exam) => ({
              id: exam.id,
              subjectName: lesson.subject?.name || "-",
              className: lesson.class?.name || "-",
              teacherName: lesson.teacher
                ? `${lesson.teacher.name} ${lesson.teacher.namalengkap}`
                : "Tidak ada guru",
              startTime: exam.startTime,
              endTime: exam.endTime,
              exTypes: exam.exType,
            }))
          );

          return { id: child.id, name: child.name, exams };
        })
      );

      students = studentsWithExams;

      return (
        <div className="w-full mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Ujian Anak</h1>

          {studentsWithExams.length === 0 ? (
            <div className="text-center text-gray-500">
              Belum ada Ujian tersedia untuk anak Anda.
            </div>
          ) : (
            studentsWithExams.map((student) => (
              <div key={student.id} className="mb-12">
                <h2 className="text-xl font-semibold mb-4">{student.name}</h2>

                {student.exams.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Belum ada Ujian untuk {student.name}.
                  </div>
                ) : (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          {columns.map((col) => (
                            <th
                              key={col.accessor}
                              className={`px-4 py-3 font-semibold text-center ${
                                col.className ?? ""
                              }`}
                            >
                              {col.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100 text-center">
                        {student.exams.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
                          >
                            {/* <td>{item.id}</td> */}
                            <td className="p-4">{item.subjectName}</td>
                            <td className="hidden md:table-cell">
                              {item.className}
                            </td>
                            <td className="hidden md:table-cell">
                              {item.teacherName}
                            </td>
                            <td className="hidden md:table-cell">
                              {item.startTime.toLocaleTimeString("id-ID", {
                                timeZone: "Asia/Jakarta",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                                day: "numeric",
                                month: "numeric",
                                year: "numeric",
                              })}
                            </td>
                            <td className="hidden md:table-cell">
                              {item.endTime.toLocaleTimeString("id-ID", {
                                timeZone: "Asia/Jakarta",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                                day: "numeric",
                                month: "numeric",
                                year: "numeric",
                              })}
                            </td>
                            <td className="hidden md:table-cell">
                              {item.exTypes ? examTypeLabel[item.exTypes] : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      );
    default:
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, namalengkap: true } },
            class: { select: { name: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.exam.count({ where: query }),
  ]);
  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch></TableSearch>
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="" width={14} height={14}></Image>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="" width={14} height={14}></Image>
              </button>
              {(role === "admin" || role === "teacher") && (
                <FormContainer table="exam" type="create"></FormContainer>
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <div className="">
          <Table columns={columns} renderRow={renderRow} data={data}></Table>
        </div>
        {/* PAGINATION*/}
        <div className="">
          <Pagination page={p} count={count}></Pagination>
        </div>
      </div>
    </ClientPageWrapper>
  );
};

export default ExamListPage;
