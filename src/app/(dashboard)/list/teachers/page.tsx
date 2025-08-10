import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortToggle from "@/components/FilterSortToggle";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TeacherListClient from "@/components/TeacherListClient";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import {
  decryptPassword,
  getCurrentUser,
  normalizeSearchParams,
} from "@/lib/utils";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

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
  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center p-4 gap-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        ></Image>
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">
        {item.subjects.map((subject) => subject.name).join(",")}
      </td>
      <td className="hidden md:table-cell">
        {item.classes.map((classItem) => classItem.name).join(",")}
      </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16}></Image>
            </button>
          </Link>
          {role === "admin" && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            //   <Image src="/delete.png" alt="" width={16} height={16}></Image>
            // </button>
            <FormContainer
              table="teacher"
              type="delete"
              id={item.id}
            ></FormContainer>
          )}
        </div>
      </td>
    </tr>
  );

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

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            All Teachers
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch></TableSearch>
            <div className="flex items-center gap-4 self-end">
              <FilterSortToggle
                filterFields={[
                  // {
                  //   name: "classId",
                  //   label: "Kelas",
                  //   options: classesData.map((cls) => ({
                  //     label: cls.name,
                  //     value: cls.id.toString(),
                  //   })),
                  // },
                  {
                    name: "subjectId",
                    label: "Mata Pelajaran",
                    options: Array.from(
                      new Map(
                        data
                          .flatMap((teacher) => teacher.subjects)
                          .map((subject) => [
                            subject.id,
                            { label: subject.name, value: subject.id },
                          ])
                      ).values()
                    ).sort((a, b) => a.label.localeCompare(b.label)),
                  },
                ]}
                sortOptions={[
                  { label: "A-Z", value: "az" },
                  { label: "Z-A", value: "za" },
                  { label: "ID Asc", value: "id_asc" },
                  { label: "ID Desc", value: "id_desc" },
                ]}
              />
              {role === "admin" && (
                // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                //   <Image src="/plus.png" alt="" width={14} height={14}></Image>
                // </button>
                <FormContainer table="teacher" type="create"></FormContainer>
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <TeacherListClient
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

export default TeacherListPage;
