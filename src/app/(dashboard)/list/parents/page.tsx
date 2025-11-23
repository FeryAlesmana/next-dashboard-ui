import ClientPageWrapper from "@/components/ClientWrapper";
import Pagination from "@/components/Pagination";
import ParentListClient from "@/components/client/ParentListClient";
import prisma from "@/lib/prisma";
import {
  decryptPassword,
  getCurrentUser,
  normalizeSearchParams,
  toIntOrNotFound,
} from "@/lib/utils";
import { Parent, Prisma, Student } from "@prisma/client";
import { notFound } from "next/navigation";

type ParentList = Parent & { students: Student[] };

const ParentsListPage = async ({
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

  const { role } = await getCurrentUser();
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
      header: "Info",
      accessor: "info",
      className: "text-center",
    },
    {
      header: "Wali Murid",
      accessor: "waliMurid",
      className: "hidden md:table-cell",
    },
    {
      header: "Nama Siswa",
      accessor: "students",
      className: "hidden md:table-cell",
    },
    {
      header: "No. Tlp",
      accessor: "phone",
      className: "hidden md:table-cell",
    },
    {
      header: "Alamat",
      accessor: "alamat",
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

  const query: Prisma.ParentWhereInput = {};
  let orderBy: Prisma.ParentOrderByWithRelationInput | undefined;
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "id":
            query.id = value;
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              {
                students: {
                  some: { name: { contains: value, mode: "insensitive" } },
                },
              },
              {
                secondaryStudents: {
                  some: { name: { contains: value, mode: "insensitive" } },
                },
              },
              {
                guardianStudents: {
                  some: { name: { contains: value, mode: "insensitive" } },
                },
              },
              { phone: { contains: value, mode: "insensitive" } },
            ];
            break;
          case "classId":
            const classId = toIntOrNotFound(value);
            query.students = { some: { classId: { equals: classId } } };
            break;
          case "gradeId":
            const gradeId = toIntOrNotFound(value);
            query.students = { some: { class: { gradeId: gradeId } } };
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
            break;
          default:
            return notFound();
        }
    }
  }

  const [parents, count, parentStudents] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      orderBy,
      include: {
        students: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
        secondaryStudents: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
        guardianStudents: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
      },
      take: perPage,
      skip: perPage ? perPage * (p - 1) : undefined,
    }),
    prisma.parent.count({ where: query }),
    prisma.student.findMany({
      select: {
        id: true,
        name: true,
      },
    }),
  ]);
  const data = parents.map((parent) => ({
    ...parent,
    password: decryptPassword(parent.password),
  }));
  // console.log(data, "data in parent");
  let relatedData = {};

  relatedData = { students: parentStudents };

  // Flatten all students from parents
  const allStudents = parents.flatMap((parent) => [
    ...parent.students,
    ...parent.secondaryStudents,
    ...parent.guardianStudents,
  ]);

  // Extract unique classes
  const classes = Array.from(
    new Map(
      allStudents
        .filter((s) => s.class) // only those with a class
        .map((s) => [s.class?.id, s.class]) // use Map to dedupe by class.id
    ).values()
  );

  // Extract unique grades (sorted ascending)
  const grades = Array.from(
    new Set(
      classes
        .map((cls) => cls?.grade?.level)
        .filter((level): level is number => level !== undefined)
    )
  ).sort((a, b) => a - b);

  const classOptions = classes.map((cls) => ({
    label: cls?.name ?? "Unknown Class",
    value: cls?.id?.toString() ?? "",
  }));
  const gradeOptions = grades.map((level) => ({
    label: level.toString(),
    value: level,
  }));
  let options = {};
  options = {
    classOptions: classOptions,
    gradeOptions: gradeOptions,
  };
  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <ParentListClient
            data={data}
            role={role!}
            columns={columns}
            relatedData={relatedData}
            options={options}
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

export default ParentsListPage;
