import ClientPageWrapper from "@/components/ClientWrapper";
import Pagination from "@/components/Pagination";
import prisma from "@/lib/prisma";
import {
  generateSemesters,
  getCurrentStaff,
  getCurrentUser,
  normalizeSearchParams,
  toIntOrNotFound,
} from "@/lib/utils";
import {
  Assignment,
  assTypes,
  Class,
  Prisma,
  staffrole,
  Subject,
  Teacher,
} from "@prisma/client";
import AssignmentListClient from "@/components/client/AssignmentListClient";
import ParentAssignmentViewSemester from "@/components/client/ParentAssigmentViewSemester";
import z from "zod";
import { notFound } from "next/navigation";

type AssignmentList = Assignment & {
  lesson: { subject: Subject; class: Class; teacher: Teacher };
};

const AssignmentListPage = async ({
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
      header: "Deadline",
      accessor: "dueDate",
      className: "hidden md:table-cell",
    },
    {
      header: "Tugas",
      accessor: "assTypes",
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
  const semesterSchema = z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  });
  const query: Prisma.AssignmentWhereInput = {};
  query.lesson ??= {};

  let orderBy: Prisma.AssignmentOrderByWithRelationInput | undefined;
  query.lesson = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "id":
            const id = toIntOrNotFound(value);
            query.id = id;
            break;
          case "teacherId":
            query.lesson.teacherId = value;
            break;
          case "classId":
            const classId = toIntOrNotFound(value);
            query.lesson.classId = classId;
            break;
          case "gradeId":
            const gradeId = toIntOrNotFound(value);
            query.lesson = query.lesson || {};
            query.lesson.class = query.lesson.class || {};
            query.lesson.class.gradeId = gradeId;
            break;
          case "semester":
            try {
              const parsed = semesterSchema.parse(JSON.parse(value as string));
              query.dueDate = {
                gte: new Date(parsed.start),
                lte: new Date(parsed.end),
              };
            } catch {
              query.id = -1; // block tampered values
            }
            break;
          case "search":
            query.lesson.subject = {
              name: { contains: value, mode: "insensitive" },
            };
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
                orderBy = { dueDate: "asc" }; // or "desc" if preferred
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
  const hasTeacherIdParam = query.lesson.teacherId !== undefined;
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
      if (!hasTeacherIdParam) {
        const teacher = await prisma.teacher.findUnique({
          where: { id: userId! },
          include: { classes: true },
        });

        const classIds = teacher?.classes.map((cls) => cls.id) ?? [];

        query.lesson.classId = {
          in: classIds,
        };
      }
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
    case "parent": {
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
      const studentWithAssignments = await Promise.all(
        children.map(async (child) => {
          if (!child.classId)
            return { id: child.id, name: child.name, assignments: [] };

          const lessons = await prisma.lesson.findMany({
            where: { classId: child.classId },
            include: {
              assignments: true,
              subject: true,
              class: true,
              teacher: { select: { name: true } },
            },
          });

          const assignments = lessons.flatMap((lesson) =>
            lesson.assignments.map((ass) => ({
              id: ass.id,
              subjectName: lesson.subject?.name || "-",
              className: lesson.class?.name || "-",
              teacherName: lesson.teacher
                ? `${lesson.teacher.name}`
                : "Tidak ada guru",
              startDate: ass.startDate,
              dueDate: ass.dueDate,
              assTypes: ass.assType,
            })),
          );

          return { ...child, assignments };
        }),
      );

      students = studentWithAssignments;

      return (
        // <ParentAssignmentView students={students} columns={columns} />
        <ParentAssignmentViewSemester
          columns={columns}
          userId={userId!}
          gradeLevel={students.map((s) => ({
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
  let kelasId: number[] = [];

  if (role === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId! },
      select: {
        classes: { select: { id: true } },
      },
    });

    const supervised = teacher?.classes.map((c) => c.id) || [];
    kelasId = [...new Set([...supervised])];
  }
  const [data, count, assignLessons, ClassAssignment] =
    await prisma.$transaction([
      prisma.assignment.findMany({
        where: query,
        orderBy,
        include: {
          lesson: {
            select: {
              subject: { select: { name: true } },
              teacher: { select: { name: true, id: true } },
              class: { select: { name: true, grade: true } },
            },
          },
        },
        take: perPage,
        skip: perPage ? perPage * (p - 1) : undefined,
      }),
      prisma.assignment.count({ where: query }),
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
        where: {
          ...(kelasId.length > 0 ? { id: { in: kelasId } } : {}),
        },
        select: {
          id: true,
          name: true,
          grade: { select: { level: true } },
        },
      }),
    ]);
  const classOptions = ClassAssignment.map((cls) => ({
    label: cls?.name ?? "Unknown Class",
    value: cls?.id?.toString() ?? "", // always string, never undefined
  }));

  const gradeOptions = Array.from(
    new Set(
      ClassAssignment.map((cls) => cls.grade?.level).filter(
        (level): level is number => level !== undefined,
      ),
    ),
  )
    .sort((a, b) => a - b)
    .map((level) => ({
      label: level.toString(),
      value: level, // stays a number
    }));

  const teacherOptions = Array.from(
    new Map(
      data
        .filter((ass) => ass.lesson?.teacher?.id)
        .map((ass) => [
          ass.lesson!.teacher!.id,
          {
            label: ass.lesson!.teacher!.name ?? "Unknown Teacher",
            value: ass.lesson!.teacher!.id.toString(), // always string
          },
        ]),
    ).values(),
  );
  let relatedData: any = {};
  relatedData = { lessons: assignLessons, kelas2: ClassAssignment };
  let options = {};
  options = {
    classOptions: classOptions,
    gradeOptions: gradeOptions,
    teacherOptions: teacherOptions,
    semesterOptions,
  };

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <AssignmentListClient
            data={data}
            columns={columns}
            role={role!}
            relatedData={relatedData}
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

export default AssignmentListPage;
