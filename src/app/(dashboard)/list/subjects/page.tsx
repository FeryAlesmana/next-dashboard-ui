import SubjectListClient from "@/components/client/SubjectListClient";
import ClientPageWrapper from "@/components/ClientWrapper";
import Pagination from "@/components/Pagination";
import prisma from "@/lib/prisma";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { Prisma, Subject, Teacher } from "@prisma/client";

type SubjectList = Subject & { teachers: Teacher[] };

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { role } = await getCurrentUser();
  const sp = await normalizeSearchParams(searchParams);
  const key = new URLSearchParams(
    Object.entries(sp).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  const { page, limit, ...queryParams } = sp;
  const p = page ? parseInt(page) : 1;
  const perPage = limit === "all" ? undefined : parseInt(limit ?? "10");

  const columns = [
    ...(role === "admin"
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
      className: "hidden md:table-cell",
    },
    {
      header: "Aksi",
      accessor: "actions",
    },
  ];

  const query: Prisma.SubjectWhereInput = {};
  let orderBy: Prisma.SubjectOrderByWithRelationInput | undefined;

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "teacherId":
            query.teachers = { some: { id: value } };
            break;
          case "classId":
            query.lessons = {
              some: {
                classId: parseInt(value),
              },
            };
            break;
          case "gradeId":
            query.lessons = {
              some: {
                class: {
                  gradeId: parseInt(value),
                },
              },
            };
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
            }
          default:
            break;
        }
    }
  }

  const [data, count, teachers, classes, grades] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      orderBy,
      include: {
        teachers: true,
      },
      take: perPage,
      skip: perPage ? perPage * (p - 1) : undefined,
    }),
    prisma.subject.count({ where: query }),
    prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        namalengkap: true,
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
    label: t.name || t.namalengkap,
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
