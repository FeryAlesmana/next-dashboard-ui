import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortToggle from "@/components/FilterSortToggle";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ParentListClient from "@/components/ParentListClient";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import {
  decryptPassword,
  getCurrentUser,
  normalizeSearchParams,
} from "@/lib/utils";
import { Parent, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

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
  const perPage = limit === "all" ? undefined : parseInt(limit ?? "10");

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
    },
    {
      header: "Wali Murid",
      accessor: "waliMurid",
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
  const renderRow = (item: ParentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center p-4 gap-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">
        {item.students.map((student) => student.name).join(",")}
      </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer
                table="parent"
                type="update"
                data={item}
              ></FormContainer>
              <FormContainer
                table="parent"
                type="delete"
                id={item.id}
              ></FormContainer>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const query: Prisma.ParentWhereInput = {};
  let orderBy: Prisma.ParentOrderByWithRelationInput | undefined;
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              {
                students: {
                  some: { name: { contains: value, mode: "insensitive" } },
                },
              },
              { phone: { contains: value, mode: "insensitive" } },
            ];
            break;
          case "classId":
            query.students = { some: { classId: { equals: parseInt(value) } } };
            break;
          case "gradeId":
            query.students = { some: { class: { gradeId: parseInt(value) } } };
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
        namalengkap: true,
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

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Semua Wali Murid
          </h1>
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
                    options: grades.map((level) => ({
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
              {role === "admin" && (
                // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                //   <Image src="/plus.png" alt="" width={14} height={14}></Image>
                // </button>
                <FormContainer table="parent" type="create"></FormContainer>
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <ParentListClient
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

export default ParentsListPage;
