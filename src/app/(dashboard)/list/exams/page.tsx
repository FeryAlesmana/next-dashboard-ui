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
import {
  generateSemesters,
  getCurrentStaff,
  getCurrentUser,
  normalizeSearchParams,
  toIntOrNotFound,
} from "@/lib/utils";
import {
  Class,
  Exam,
  exTypes,
  Prisma,
  staffrole,
  Subject,
  Teacher,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import ParentExamViewSemester from "@/components/client/ParentExamViewSemester";
import z from "zod";
import { notFound } from "next/navigation";

type ExamList = Exam & {
  lesson: { subject: Subject; class: Class; teacher: Teacher };
};

const ExamListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const sp = await normalizeSearchParams(searchParams);
  const { page, limit, ...queryParams } = sp;
  const key = new URLSearchParams(
    Object.entries(sp).reduce(
      (acc, [k, v]) => {
        if (v !== undefined) acc[k] = v;
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();
  const p = sp.search ? 1 : page ? parseInt(page) : 1;
  const perPage = limit === "all" ? 50 : parseInt(limit ?? "10");

  const { role, userId } = await getCurrentUser();
  let staffRole: staffrole;
  if (role === "staff") {
    const staffrole = await getCurrentStaff(userId!);
    staffRole = staffrole;
  }
  const allowedStaff = role === "staff" && staffRole! === "PENILAIAN";
  const allowedRole = role === "admin" || role === "teacher" || allowedStaff;
  const columns = [
    ...(role === "admin" || allowedStaff
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
      header: "Tanggal",
      accessor: "date",
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
    ...(allowedRole
      ? [
          {
            header: "Aksi",
            accessor: "action",
          },
        ]
      : []),
  ];

  const query: Prisma.ExamWhereInput = {};
  let orderBy: Prisma.ExamOrderByWithRelationInput | undefined;

  query.lesson = {};

  const semesterSchema = z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  });
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "teacherId":
            query.lesson.teacherId = value;
            break;
          case "classId":
            const classId = toIntOrNotFound(value);
            query.lesson.classId = classId;
            break;
          case "semester":
            try {
              const parsed = semesterSchema.parse(JSON.parse(value as string));
              query.lesson = {
                is: {
                  startTime: { gte: new Date(parsed.start) },
                  endTime: { lte: new Date(parsed.end) },
                },
              };
            } catch {
              query.id = -1; // block tampered values
            }
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
          case "sort":
            switch (value) {
              case "az":
                orderBy = { title: "asc" };
                break;
              case "za":
                orderBy = { title: "desc" };
                break;
              case "id_asc":
                orderBy = { id: "asc" };
                break;
              case "id_desc":
                orderBy = { id: "desc" };
                break;
              case "dl":
                orderBy = { date: "asc" }; // or "desc" if preferred
                break;
              default:
                return notFound();
            }
            break;
          default:
            return notFound();
        }
    }
  }

  // ROLE CONDITIONS
  let gradeLevel = 3;
  let students: any[] = [];
  let semesterOptions: any = [];
  switch (role) {
    case "admin":
      const oldest = await prisma.student.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true, grade: { select: { level: true } } },
      });
      // 2️⃣ Get the highest grade level
      const highest = await prisma.grade.aggregate({
        _max: { level: true },
      });
      if (oldest) {
        semesterOptions = generateSemesters(
          oldest.createdAt,
          highest._max.level ?? 3,
          role,
        );
      }
      break;
    case "teacher":
      query.lesson.teacherId = userId!;
      const teacher = await prisma.teacher.findUnique({
        where: { id: userId! },
        select: {
          classes: {
            select: {
              students: {
                select: { createdAt: true, grade: { select: { level: true } } },
              },
            },
          },
        },
      });

      const Murid = teacher?.classes.flatMap((kelas) => kelas.students) ?? [];
      if (Murid.length > 0) {
        const highest = Murid.reduce((a, b) =>
          (a.grade?.level ?? 0) > (b.grade?.level ?? 0) ? a : b,
        );

        semesterOptions = generateSemesters(
          highest.createdAt,
          highest.grade?.level ?? 1,
          role,
        );
      }
      break;
    case "student":
      const student = await prisma.student.findUnique({
        where: { id: userId! },
        select: {
          class: { select: { grade: { select: { level: true } } } },
          createdAt: true,
        },
      });

      gradeLevel = student?.class?.grade?.level ?? 3;
      query.lesson.class = {
        students: {
          some: {
            id: userId!,
          },
        },
      };

      if (student) {
        semesterOptions = generateSemesters(
          student.createdAt,
          gradeLevel,
          role,
        );
      }
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
        select: {
          classId: true,
          name: true,
          id: true,
          class: {
            select: { name: true, grade: { select: { level: true } } },
          },
          createdAt: true,
        },
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
              class: {
                select: { grade: { select: { level: true } }, name: true },
              },
              teacher: { select: { name: true } },
            },
          });

          const exams = lessons.flatMap((lesson) =>
            lesson.exams.map((exam) => ({
              id: exam.id,
              subjectName: lesson.subject?.name || "-",
              className: lesson.class?.name || "-",
              teacherName: lesson.teacher
                ? `${lesson.teacher.name}`
                : "Tidak ada guru",
              startTime: exam.startTime,
              endTime: exam.endTime,
              exType: exam.exType,
            })),
          );

          return { ...child, exams };
        }),
      );

      students = studentsWithExams;

      return (
        // <ParentExamView students={students} columns={columns} />
        <ParentExamViewSemester
          userId={userId!}
          gradeLevel={students.map((s) => ({
            studentId: s.id,
            gradeLevel: s.class?.grade?.level,
            createdAt: s.createdAt,
          }))}
          columns={columns}
        />
      );
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
            teacher: { select: { name: true } },
            class: { select: { name: true } },
          },
        },
      },
      take: perPage,
      skip: perPage ? perPage * (p - 1) : undefined,
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

  const classOptions = classes.map((cls) => ({
    label: cls?.name ?? "Unknown Class",
    value: cls?.id?.toString() ?? "",
  }));

  const gradeOptions = Array.from(
    new Set(
      classes
        .map((cls) => cls.grade?.level)
        .filter((level): level is number => level !== undefined),
    ),
  )
    .sort((a, b) => a - b)
    .map((level) => ({
      label: level.toString(),
      value: level,
    }));
  let options = {};
  options = {
    classOptions: classOptions,
    gradeOptions: gradeOptions,
    semesterOptions,
  };
  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <ExamListClient
            data={data}
            role={role!}
            columns={columns}
            relatedData={relatedData}
            gradeLevel={gradeLevel}
            options={options}
            staffrole={staffRole!}
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
