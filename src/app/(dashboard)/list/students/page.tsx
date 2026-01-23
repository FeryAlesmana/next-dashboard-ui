import ClientPageWrapper from "@/components/ClientWrapper";
import Pagination from "@/components/Pagination";
import prisma from "@/lib/prisma";
import {
  decryptPassword,
  getCurrentStaff,
  getCurrentUser,
  normalizeSearchParams,
  toIntOrNotFound,
} from "@/lib/utils";
import { Class, Prisma, staffrole, Student } from "@prisma/client";
import React from "react";
import StudentListClient from "@/components/client/StudentListClient";
import { notFound } from "next/navigation";

const StudentsListPage = async ({
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
  const allowedStaff = role === "staff" && staffRole! === "PENILAIAN";
  const allowedRole = role === "admin" || allowedStaff;
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
      header: "Nama Siswa",
      accessor: "name",
      className: "text-center md:text-left",
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
    ...(allowedRole
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
              { username: { contains: value, mode: "insensitive" } },
            ];
            break;
          case "classId":
            const classId = toIntOrNotFound(value);
            query.classId = classId;
            break;
          case "gradeId":
            const gradeId = toIntOrNotFound(value);
            query.class = {
              is: {
                gradeId: gradeId,
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
            return notFound();
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
      },
    }),
  ]);
  const data = students.map((student) => ({
    ...student,
    password: decryptPassword(student.password),
  }));

  // console.log(data, "data in student");

  const grades = Array.from(
    new Map(classes.map((c) => [c.grade?.id, c.grade])).values(),
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
        .filter((level): level is number => level !== undefined),
    ),
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

export default StudentsListPage;
