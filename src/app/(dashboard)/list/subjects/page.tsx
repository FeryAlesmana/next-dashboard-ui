import SubjectListClient from "@/components/client/SubjectListClient";
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
import { Prisma, staffrole, Subject, Teacher } from "@prisma/client";
import { notFound } from "next/navigation";
import z from "zod";

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { role, userId } = await getCurrentUser();
  const sp = await normalizeSearchParams(searchParams);
  const key = new URLSearchParams(
    Object.entries(sp).reduce(
      (acc, [k, v]) => {
        if (v !== undefined) acc[k] = v;
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();
  const { page, limit, ...queryParams } = sp;
  const p = sp.search ? 1 : page ? parseInt(page) : 1;
  const perPage = limit === "all" ? 50 : parseInt(limit ?? "10");
  let staffRole: staffrole;
  if (role === "staff") {
    const staffrole = await getCurrentStaff(userId!);
    staffRole = staffrole;
  }
  const allowedStaff = role === "staff" && staffRole! === "PENJADWALAN";
  const allowedRole = role === "admin" || allowedStaff;
  const columns = [
    ...(allowedRole
      ? [
          {
            header: "Select",
            accessor: "checkbox",
            className: "w-[100px] text-left",
          },
        ]
      : []),
    {
      header: "ID_Mata Pelajaran",
      accessor: "subjectId",
      className: "hidden md:table-cell w-[150px] text-left",
    },
    {
      header: "Mata Pelajaran",
      accessor: "info",
      className: "text-center",
    },
    {
      header: "Guru",
      accessor: "teachers",
    },
    {
      header: "Jadwal",
      accessor: "lessons",
    },
    ...(allowedRole
      ? [
          {
            header: "Aksi",
            accessor: "actions",
          },
        ]
      : []),
  ];

  const query: Prisma.SubjectWhereInput = {};
  let orderBy: Prisma.SubjectOrderByWithRelationInput | undefined;
  let semesterOptions: any = [];
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
      "admin",
    );
  }
  const semesterSchema = z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  });
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "teacherId":
            query.teachers = { some: { id: value } };
            break;
          case "classId":
            const classId = toIntOrNotFound(value);
            query.lessons = {
              some: {
                classId: classId,
              },
            };
            break;
          case "gradeId":
            const gradeId = toIntOrNotFound(value);
            query.lessons = {
              some: {
                class: {
                  gradeId: gradeId,
                },
              },
            };
            break;
          case "semester":
            try {
              const parsed = semesterSchema.parse(JSON.parse(value as string));

              query.lessons = {
                some: {
                  meetings: {
                    some: {
                      startTime: {
                        gte: new Date(parsed.start),
                        lte: new Date(parsed.end),
                      },
                    },
                  },
                },
              };
            } catch {
              query.id = -1; // block tampered values
            }
            break;

          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          case "sort":
            switch (value) {
              case "az":
                orderBy = { name: "asc" };
                break;
              case "za":
                orderBy = { name: "desc" };
                break;
              case "id_asc":
                orderBy = { id: "asc" };
                break;
              case "id_desc":
                orderBy = { id: "desc" };
                break;
              default:
                return notFound();
            }
          default:
            return notFound();
        }
    }
  }

  const [data, count, teachers, classes, grades] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      orderBy,
      include: {
        teachers: true,
        lessons: true,
      },
      take: perPage,
      skip: perPage ? perPage * (p - 1) : undefined,
    }),
    prisma.subject.count({ where: query }),
    prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.class.findMany({
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.grade.findMany({
      select: {
        id: true,
        level: true,
      },
    }),
  ]);

  const teacherOptions = teachers.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const classOptions = classes.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const gradeOptions = grades.map((g) => ({
    value: g.id,
    label: g.level,
  }));

  let options = {
    classOptions,
    gradeOptions,
    teacherOptions,
    semesterOptions,
  };

  let relatedData = { teachers };
  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <SubjectListClient
            columns={columns}
            data={data}
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

export default SubjectListPage;
