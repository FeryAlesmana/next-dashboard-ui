import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortToggle from "@/components/FilterSortToggle";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import StudentTableClient from "@/components/StudentTableClient";
import StudentTableServer from "@/components/StudentListClient";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import StudentListClient from "@/components/StudentListClient";

type StudentList = Student & {
  class: Class;
  student_details: { nisn: string; noWA: string };
};

const StudentsListPage = async ({
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
      header: "Nama Siswa",
      accessor: "name",
    },
    {
      header: "NISN",
      accessor: "ID Murid",
      className: "hidden md:table-cell",
    },
    {
      header: "Tingkat",
      accessor: "Kode Kelas",
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
  const renderRow = (item: StudentList) => (
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
          <p className="text-xs text-gray-500">{item.class.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.student_details.nisn}</td>
      <td className="hidden md:table-cell">{item.class.name[0]}</td>
      <td className="hidden md:table-cell">
        {item.student_details.noWA ?? item.phone}
      </td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16}></Image>
            </button>
          </Link>
          {role === "admin" && (
            <FormContainer
              table="student"
              type="delete"
              id={item.id}
            ></FormContainer>
          )}
        </div>
      </td>
    </tr>
  );

  const query: Prisma.StudentWhereInput = {};
  let orderBy: Prisma.StudentOrderByWithRelationInput | undefined;

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "teacherId":
            {
              query.class = {
                lessons: {
                  some: {
                    teacherId: value,
                  },
                },
              };
            }
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { class: { name: { contains: value, mode: "insensitive" } } },
              {
                student_details: {
                  nisn: { contains: value, mode: "insensitive" },
                },
              },
            ];
            break;
          case "classId":
            query.classId = parseInt(value);
            break;
          case "gradeId":
            query.class = {
              is: {
                gradeId: parseInt(value),
              },
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
                orderBy = { student_details: { nisn: "asc" } };
                break;
              case "id_desc":
                orderBy = { student_details: { nisn: "desc" } };
                break;
            }
            break;
          default:
            break;
        }
    }
  }

  const [data, count, classesData] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      orderBy,
      include: {
        class: true,
        student_details: true,
        grade: true,
      },
      take: perPage,
      skip: perPage ? perPage * (p - 1) : undefined,
    }),
    prisma.student.count({ where: query }),
    prisma.class.findMany({
      include: { grade: true, _count: { select: { students: true } } },
    }),
  ]);

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Semua Murid ({count} Siswa)
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch></TableSearch>
            <div className="flex items-center gap-4 self-end">
              <FilterSortToggle
                filterFields={[
                  {
                    name: "classId",
                    label: "Kelas",
                    options: classesData.map((cls) => ({
                      label: cls.name,
                      value: cls.id.toString(),
                    })),
                  },
                  {
                    name: "gradeId",
                    label: "Tingkat",
                    options: Array.from(
                      new Set(
                        classesData
                          .map((cls) => cls.grade?.level)
                          .filter(
                            (level): level is number => level !== undefined
                          )
                      )
                    )
                      .sort((a, b) => a - b)
                      .map((level) => ({
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
                <FormContainer table="student" type="create"></FormContainer>
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns}>
            {data.map((item) => (
              <React.Fragment key={item.id}>
                <StudentTableClient  student={item} role={role!} />
              </React.Fragment>
            ))}
          </Table> */}

          <StudentListClient
            students={data}
            role={role!}
            columns={columns}
            relatedData={classesData}
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

export default StudentsListPage;
