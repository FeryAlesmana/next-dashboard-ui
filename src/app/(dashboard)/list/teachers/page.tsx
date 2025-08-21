import ClientPageWrapper from "@/components/ClientWrapper";
import Pagination from "@/components/Pagination";
import TeacherListClient from "@/components/client/TeacherListClient";
import prisma from "@/lib/prisma";
import {
  decryptPassword,
  getCurrentUser,
  normalizeSearchParams,
} from "@/lib/utils";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const TeacherListPage = async ({
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
          },
        ]
      : []),
    {
      header: "Nama Guru dan Email Guru ",
      accessor: "info",
    },
    {
      header: "ID Guru",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Pelajaran",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Kelas",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "No. Tlp",
      accessor: "phone",
      className: "hidden md:table-cell",
    },
    {
      header: "Alamat",
      accessor: "address",
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

  const query: Prisma.TeacherWhereInput = {};
  let orderBy: Prisma.TeacherOrderByWithRelationInput | undefined;

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "classId":
            {
              query.lessons = {
                some: {
                  classId: parseInt(value),
                },
              };
            }
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { id: { contains: value, mode: "insensitive" } },
              { phone: { contains: value, mode: "insensitive" } },
            ];
            break;
          case "subjectId":
            query.subjects = {
              some: { id: parseInt(value) },
            };
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
            break;
          default:
            break;
        }
    }
  }

  const [teachers, count, subjects, lessons, classes] =
    await prisma.$transaction([
      prisma.teacher.findMany({
        where: query,
        orderBy,
        include: {
          subjects: { select: { id: true, name: true } },
          classes: true,
          lessons: true,
        },
        take: perPage,
        skip: perPage ? perPage * (p - 1) : undefined,
      }),
      prisma.teacher.count({ where: query }),
      prisma.subject.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.lesson.findMany({
        select: {
          id: true,
          name: true,
          day: true,
        },
      }),
      prisma.class.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
    ]);
  let relatedData = {};
  relatedData = { subjects: subjects, lessons: lessons, classes: classes };
  // console.log(data);

  const data = teachers.map((teacher) => ({
    ...teacher,
    password: decryptPassword(teacher.password),
  }));
  // console.log(data, "data in teacher");
  const classOptions = classes.map((cls) => ({
    label: cls.name,
    value: cls.id.toString(),
  }));
  const subjectOptions = Array.from(
    new Map(
      data
        .flatMap((teacher) => teacher.subjects)
        .map((subject) => [
          subject.id,
          { label: subject.name, value: subject.id },
        ])
    ).values()
  ).sort((a, b) => a.label.localeCompare(b.label));
  let options = {
    classOptions: classOptions,
    subjectOptions: subjectOptions,
  };

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <TeacherListClient
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

export default TeacherListPage;
