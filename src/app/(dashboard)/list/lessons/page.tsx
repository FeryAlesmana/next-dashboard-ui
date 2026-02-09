import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortBar from "@/components/FilterSortBar";
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
import { Day, Prisma, staffrole } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { LessonWithRelations } from "../attendance/page";
import ParentLessonView from "@/components/client/ParentLessonView";
import LessonListClient from "@/components/client/LessonListClient";
import ParentLessonViewSemester from "@/components/client/ParentLessonViewSemester";
import StudentLessonViewSemester from "@/components/client/StudentLessonView";
import z from "zod";
import { notFound } from "next/navigation";
import SupervisedView from "@/components/SupervisedView";

// type LessonList = Lesson & { subject: Subject } & { class: Class } & {
//   teacher: Teacher;
// };

const LessonListPage = async ({
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

  const p = page ? parseInt(page) : 1;

  const perPage = limit === "all" ? 50 : parseInt(limit ?? "10");

  const { role, userId } = await getCurrentUser();
  let staffRole: staffrole;
  if (role === "staff") {
    const staffrole = await getCurrentStaff(userId!);
    staffRole = staffrole;
  }
  const allowedStaff = role === "staff" && staffRole! === "PENJADWALAN";
  const allowedRole = role === "admin" || allowedStaff;
  const columns = [
    ...(role === "admin" || allowedStaff
      ? [
          {
            header: "Select",
            accessor: "checkbox",
          },
        ]
      : []),
    // {
    //   header: "ID Jadwal",
    //   accessor: "lessonId",
    //   className: "hidden md:table-cell",
    // },
    {
      header: "Mata Pelajaran",
      accessor: "Nama",
    },
    {
      header: "Kelas",
      accessor: "kelas",
      className: "hidden md:table-cell",
    },
    {
      header: "Mulai",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "Berakhir",
      accessor: "endTime",
      className: "hidden md:table-cell",
    },
    {
      header: "Hari",
      accessor: "Day",
    },
    {
      header: "Guru",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Pertemuan",
      accessor: "meeting",
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

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* <td className="hidden md:table-cell">{item?.id}</td> */}
      <td className="flex items-center p-4 gap-4">
        {item.subject?.name || "-"}
      </td>
      <td className="hidden md:table-cell">
        {item.class?.name || "Tidak Ada Kelas"}
      </td>
      <td className="hidden md:table-cell"> {item.startTime}</td>
      <td className="hidden md:table-cell"> {item.endTime}</td>
      <td>{item.day}</td>
      <td className="hidden md:table-cell">
        {item.teacher ? `${item.teacher.name}` : "Tidak ada guru"}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {item?.class && (
            <Link href={`/list/attendance/${item.class.name}/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full">
                <Image src="/moreDark.png" alt="" width={16} height={16} />
              </button>
            </Link>
          )}
          <span className="hidden md:block text-sm text-gray-600">
            Jumlah : {item._count?.meetings || "0"}
          </span>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer
                table="lesson"
                type="update"
                data={item}
              ></FormContainer>
              <FormContainer
                table="lesson"
                type="delete"
                id={item.id}
              ></FormContainer>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const query: Prisma.LessonWhereInput = {};
  let orderBy:
    | Prisma.LessonOrderByWithRelationInput
    | Prisma.LessonOrderByWithRelationInput[] = {};

  const semesterSchema = z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  });
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "teacherId":
            query.teacherId = value.trim();
            // console.log("teacherId param:", value);

            break;
          case "classId":
            const classId = toIntOrNotFound(value);
            query.classId = classId;
            break;
          case "gradeId":
            const gradeId = toIntOrNotFound(value);
            query.class = {
              is: {
                gradeId: gradeId,
              },
            };
            break;
          case "semester":
            try {
              const parsed = semesterSchema.parse(JSON.parse(value as string));
              query.meetings = {
                some: {
                  startTime: {
                    gte: new Date(parsed.start),
                    lte: new Date(parsed.end),
                  },
                },
              };
            } catch (e) {
              query.id = -1; // block tampered values
            }
            break;
          case "day": {
            const day = value.toString().toUpperCase();

            if (!Object.values(Day).includes(day as Day)) {
              return notFound();
            }

            query.day = day as Day;
            break;
          }
          case "search":
            query.OR = [
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
              { class: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          case "sort":
            switch (value) {
              case "az":
                orderBy = { subject: { name: "asc" } };
                break;
              case "za":
                orderBy = { subject: { name: "desc" } };
                break;
              case "id_asc":
                orderBy = { id: "asc" };
                break;
              case "id_desc":
                orderBy = { id: "desc" };
                break;
              case "day":
                orderBy = [
                  { day: "asc" },
                  { startTime: "asc" }, // 👈 HH:MM string sorts correctly
                ];
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
  // ROLE CONDITION

  const hasTeacherIdParam = query.teacherId !== undefined;
  let teacherLesson: any[] = [];
  let gradeLevel = 3;
  let semesterOptions: any = [];
  // ROLE CONDITION
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
    case "teacher": {
      if (!hasTeacherIdParam) {
        const teacher = await prisma.teacher.findUnique({
          where: { clerkId: userId! },
          include: { classes: { select: { id: true, name: true } } },
        });

        // Fetch supervised classes directly
        const supervisedClasses = teacher?.classes || [];
        const supervisedClassesWithLessons = await Promise.all(
          supervisedClasses.map(async (cls) => {
            const lessons = await prisma.lesson.findMany({
              where: { classId: cls.id },
              include: {
                subject: { select: { name: true } },
                teacher: { select: { name: true } },
              },
            });
            return { ...cls, lessons };
          }),
        );
        // Fetch teaching lessons separately
        const [teachingLessons, lessonCount] = await prisma.$transaction([
          prisma.lesson.findMany({
            where: { teacherId: userId! },
            include: {
              subject: { select: { name: true } },
              class: { select: { name: true, gradeId: true } },
              teacher: { select: { name: true } },
            },
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
          }),
          prisma.lesson.count({ where: { teacherId: userId! } }),
        ]);
        teacherLesson = supervisedClassesWithLessons;
        return (
          <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">

            <SupervisedView teacherLesson={teacherLesson} />

            {/* Teaching Lessons */}
            <div className="mb-8">
              <h2 className="text-md font-semibold mb-2">
                Jadwal Mengajar Guru
              </h2>
              <Table
                columns={columns}
                renderRow={renderRow}
                data={teachingLessons}
              ></Table>
              <Pagination page={p} count={lessonCount} />
            </div>
          </div>
        );
      }
      break;
    }
    case "student":
      const student = await prisma.student.findUnique({
        where: {
          clerkId: userId!,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          class: {
            select: { name: true, grade: { select: { level: true } } },
          },
          student_details: { select: { nisn: true } },
        },
      });
      if (!student) {
        return (
          <div className="p-8 text-center text-gray-500">
            Tidak ada data murid terkait akun Anda.
          </div>
        );
      }
      // ✅ TypeScript now knows student is defined below
      const gradeLevel = student.class?.grade?.level;
      const createdAt = student.createdAt;
      return (
        <>
          <StudentLessonViewSemester
            userId={student.id!}
            gradeLevel={gradeLevel!}
            createdAt={createdAt}
          ></StudentLessonViewSemester>
        </>
      );
    case "parent": {
      const parent = await prisma.parent.findUnique({
        where: { clerkId: userId! },
        select: {
          students: {
            select: {
              id: true,
              name: true,
              classId: true,
              createdAt: true,
              class: {
                select: {
                  name: true,
                  grade: { select: { level: true } },
                },
              },
            },
          },
          secondaryStudents: {
            select: {
              id: true,
              name: true,
              classId: true,
              createdAt: true,
              class: {
                select: {
                  name: true,
                  grade: { select: { level: true } },
                },
              },
            },
          },
          guardianStudents: {
            select: {
              id: true,
              name: true,
              classId: true,
              createdAt: true,
              class: {
                select: {
                  name: true,
                  grade: { select: { level: true } },
                },
              },
            },
          },
        },
      });

      const children = [
        ...(parent?.students ?? []),
        ...(parent?.secondaryStudents ?? []),
        ...(parent?.guardianStudents ?? []),
      ];
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

      query.classId = { in: classIds };

      const studentsWithLessons = await Promise.all(
        children.map(async (child) => {
          const lessons = child.classId
            ? await prisma.lesson.findMany({
                where: { classId: child.classId },
                include: {
                  subject: true,
                  class: true,
                  teacher: { select: { name: true } },
                },
              })
            : [];

          return { ...child, lessons };
        }),
      );

      return (
        <ParentLessonViewSemester
          userId={userId!}
          gradeLevel={studentsWithLessons.map((s) => ({
            studentId: s.id,
            gradeLevel: s.class?.grade?.level,
            createdAt: s.createdAt,
          }))}
        />
      );
    }
    default:
      break;
  }

  const [data, count, classesData] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      orderBy,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true, gradeId: true } },
        teacher: { select: { name: true } },
        _count: { select: { meetings: true } },
      },
      take: perPage,
      skip: perPage ? perPage * (p - 1) : undefined,
    }),
    prisma.lesson.count({ where: query }),
    prisma.class.findMany({
      include: { grade: true, _count: { select: { students: true } } },
    }),
  ]);
  const lessonSubjects = await prisma.subject.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  const lessonClasses = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  const Lessonteachers = await prisma.teacher.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  let relatedData = {
    subjects: lessonSubjects,
    classes: lessonClasses,
    teachers: Lessonteachers,
  };
  const classOptions = classesData
    .slice() // avoid mutating original array
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((cls) => ({
      label: cls.name,
      value: cls.id.toString(),
    }));

  const gradeOptions = Array.from(
    new Set(
      classesData
        .map((cls) => cls.grade?.level)
        .filter((level): level is number => level !== undefined),
    ),
  )
    .sort((a, b) => a - b)
    .map((level) => ({
      label: level.toString(),
      value: level,
    }));

  let options = {
    classOptions,
    gradeOptions,
    semesterOptions,
  };
  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <LessonListClient
            columns={columns}
            data={data}
            role={role!}
            relatedData={relatedData}
            options={options}
            gradeLevel={gradeLevel}
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

export default LessonListPage;
