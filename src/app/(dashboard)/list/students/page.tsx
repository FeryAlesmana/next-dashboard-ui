import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortToggle from "@/components/FilterSortToggle";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import StudentTableClient from "@/components/client/StudentTableClient";
import StudentTableServer from "@/components/client/StudentListClient";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import {
  decryptPassword,
  getCurrentUser,
  normalizeSearchParams,
} from "@/lib/utils";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import StudentListClient from "@/components/client/StudentListClient";

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
                  noWa: { contains: value, mode: "insensitive" },
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

  const [students, count, classes, parents] = await prisma.$transaction([
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
    prisma.parent.findMany({
      select: {
        id: true,
        name: true,
        namalengkap: true,
      },
    }),
  ]);
  const data = students.map((student) => ({
    ...student,
    password: decryptPassword(student.password),
  }));

  // console.log(data, "data in student");

  const grades = Array.from(
    new Map(classes.map((c) => [c.grade?.id, c.grade])).values()
  );

  // console.log(grades, "Tingkat di studentList");
  const classOptions = classes.map((cls) => ({
    label: cls.name,
    value: cls.id.toString(),
  }));
  const gradeOptions = Array.from(
    new Set(
      classes
        .map((cls) => cls.grade?.level)
        .filter((level): level is number => level !== undefined)
    )
  )
    .sort((a, b) => a - b)
    .map((level) => ({
      label: level.toString(),
      value: level,
    }));

  let options = { gradeOptions, classOptions };
  let relatedData = { classes: classes, parents: parents, grades: grades };

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}

        {/* LIST */}
        <div className="">
          <StudentListClient
            data={data}
            role={role!}
            columns={columns}
            relatedData={relatedData}
            count={count}
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

export default StudentsListPage;
