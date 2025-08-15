import ParentExamView from "@/components/client/ParentExamView";
import ClientPageWrapper from "@/components/ClientWrapper";
import ExamListClient from "@/components/client/ExamListClient";
import FilterSortToggle from "@/components/FilterSortToggle";
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
    ...(role === "admin"
      ? [
          {
            header: "Select",
            accessor: "checkbox",
          },
        ]
      : []),
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

      return <ParentExamView students={students} columns={columns} />;
    default:
      break;
  }

  const [data, count, examLessons, classes] = await prisma.$transaction([
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
    prisma.lesson.findMany({
      where: {
        ...(role === "teacher" ? { teacherId: userId! } : {}),
      },
      select: {
        id: true,
        name: true,
        subject: { select: { name: true } },
        class: { select: { name: true } },
      },
    }),
    prisma.class.findMany({
      select: {
        id: true,
        name: true,
        grade: { select: { level: true } },
      },
    }),
  ]);
  let relatedData = {};
  relatedData = { lessons: examLessons };

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch></TableSearch>
            <div className="flex items-center gap-4 self-end">
              <FilterSortToggle
                filterFields={[
                  {
                    name: "classId",
                    label: "Kelas",
                    options: classes.map((cls) => ({
                      label: cls?.name ?? "Unknown Class",
                      value: cls?.id?.toString() ?? "",
                    })),
                  },
                  {
                    name: "gradeId",
                    label: "Tingkat",
                    options: Array.from(
                      new Set(
                        classes
                          .map((cls) => cls.grade?.level)
                          .filter(
                            (level): level is number => level !== undefined
                          )
                      )
                    )
                      .sort((a, b) => a - b)
                      .map((level) => ({
                        label: level.toString(),
                        value: level,
                      })),
                  },
                ]}
                sortOptions={[
                  { label: "A-Z", value: "az" },
                  { label: "Z-A", value: "za" },
                  { label: "ID Asc", value: "id_asc" },
                  { label: "ID Desc", value: "id_desc" },
                ]}
              />
              {(role === "admin" || role === "teacher") && (
                <FormContainer table="exam" type="create"></FormContainer>
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <ExamListClient
            data={data}
            role={role!}
            columns={columns}
            relatedData={relatedData}
          />
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
