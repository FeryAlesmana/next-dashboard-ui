import ClassesListClient from "@/components/client/ClassesListClient";
import ClientPageWrapper from "@/components/ClientWrapper";
import Pagination from "@/components/Pagination";
import prisma from "@/lib/prisma";
import {
  getCurrentStaff,
  getCurrentUser,
  normalizeSearchParams,
  toIntOrNotFound,
} from "@/lib/utils";
import { Prisma, staffrole } from "@prisma/client";
import { notFound } from "next/navigation";

const ClassListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const sp = await normalizeSearchParams(searchParams);
  const { page, limit, ...queryParams } = sp;
  const key = new URLSearchParams(
    Object.entries(sp).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  const p = page ? parseInt(page) : 1;
  const perPage = limit === "all" ? 50 : parseInt(limit ?? "10");
  const { role, userId } = await getCurrentUser();
  let staffRole: staffrole;
  if (role === "staff") {
    const staffrole = await getCurrentStaff(userId!);
    staffRole = staffrole;
  }
  const allowedStaff = role === "staff" && staffRole! === "PENILAIAN";
  const allowedRole = role === "admin" || allowedStaff;
  const columns = [
    ...(allowedRole
      ? [
          {
            header: "Select",
            accessor: "checkbox",
          },
        ]
      : []),
    {
      header: "Nama Kelas",
      accessor: "Nama",
    },
    {
      header: "Kapasitas",
      accessor: "kapasitas",
      className: "hidden md:table-cell",
    },
    {
      header: "Murid",
      accessor: "students",
    },
    {
      header: "Tingkat",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Wali Kelas",
      accessor: "supervisor",
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

  const query: Prisma.ClassWhereInput = {};
  let orderBy: Prisma.ClassOrderByWithRelationInput | undefined;

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "supervisorId":
            query.supervisorId = value;
            break;
          case "capacity":
            const capacity = toIntOrNotFound(value);
            query.capacity = capacity;
            break;

          case "gradeId":
            const gradeId = toIntOrNotFound(value);
            query.gradeId = gradeId;
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { capacity: { equals: parseInt(value) } },
            ];
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
              case "cp_asc":
                orderBy = { capacity: "asc" };
                break;
              case "cp_desc":
                orderBy = { capacity: "desc" };
                break;
              default:
                return notFound();
            }
          default:
            return notFound();
        }
    }
  }

  const [data, count, classGrades, classTeacher] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      orderBy,
      include: {
        supervisor: true,
        _count: {
          select: { students: true },
        },
        students: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
        grade: true,
      },
      take: perPage,
      skip: perPage ? perPage * (p - 1) : undefined,
    }),
    prisma.class.count({ where: query }),
    prisma.grade.findMany({
      select: {
        id: true,
        level: true,
      },
    }),
    prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  const teacherOptions = classTeacher.map((teacher) => ({
    value: teacher.id,
    label: `${teacher.name}`,
  }));

  const gradeOptions = classGrades.map((grade) => ({
    value: grade.id,
    label: grade.level,
  }));

  const capacityOptions = data.map((cls) => ({
    value: cls.capacity,
    label: cls.capacity
      ? cls.capacity.toString() + " Murid"
      : "Tidak Diketahui",
  }));

  let options = {
    teacherOptions,
    gradeOptions,
    capacityOptions,
  };
  let relatedData = { teachers: classTeacher, grades: classGrades };
  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* LIST */}
        <div className="">
          <ClassesListClient
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

export default ClassListPage;
