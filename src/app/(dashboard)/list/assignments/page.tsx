import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortToggle from "@/components/FilterSortToggle";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ParentAssignmentView from "@/components/client/ParentAssignmentView";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import {
  Assignment,
  assTypes,
  Class,
  Prisma,
  Subject,
  Teacher,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import AssignmentListClient from "@/components/client/AssignmentListClient";

type AssignmentList = Assignment & {
  lesson: { subject: Subject; class: Class; teacher: Teacher };
};

const AssignmentListPage = async ({
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
  const { role, userId } = await getCurrentUser();

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
      header: "Mata Pelajaran",
      accessor: "Nama",
    },
    {
      header: "Kelas",
      accessor: "kelas",
    },
    {
      header: "Guru",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Deadline",
      accessor: "dueDate",
      className: "hidden md:table-cell",
    },
    {
      header: "Tugas",
      accessor: "assTypes",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role == "teacher"
      ? [
          {
            header: "Aksi",
            accessor: "action",
          },
        ]
      : []),
  ];
  const AssignmentsTypeLabel = {
    PEKERJAAN_RUMAH: "Pekerjaan Rumah",
    TUGAS_AKHIR: "Tugas Akhir",
    TUGAS_HARIAN: "Tugas Harian",
  } as const;

  type assType = keyof typeof AssignmentsTypeLabel;
  const renderRow = (item: AssignmentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center p-4 gap-4">
        {item.lesson.subject?.name || "-"}
      </td>
      <td>{item.lesson.class.name}</td>
      <td className="hidden md:table-cell">
        {item.lesson.teacher
          ? `${item.lesson.teacher.name} ${item.lesson.teacher.namalengkap}`
          : "Tidak ada guru"}
      </td>
      <td className="hidden md:table-cell">
        {" "}
        {item.dueDate.toLocaleDateString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          day: "numeric",
          month: "numeric",
        })}
      </td>
      <td className="hidden md:table-cell">
        {item.assType ? AssignmentsTypeLabel[item.assType as assType] : "-"}
      </td>

      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer
                table="assignment"
                type="update"
                data={item}
              ></FormContainer>
              <FormContainer
                table="assignment"
                type="delete"
                id={item.id}
              ></FormContainer>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const query: Prisma.AssignmentWhereInput = {};
  let orderBy: Prisma.AssignmentOrderByWithRelationInput | undefined;
  query.lesson = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "teacherId":
            query.lesson.teacherId = value;
            break;
          case "classId":
            query.lesson.classId = parseInt(value);
            break;
          case "gradeId":
            query.lesson = query.lesson || {};
            query.lesson.class = query.lesson.class || {};
            query.lesson.class.gradeId = parseInt(value);
            break;

          case "search":
            query.lesson.subject = {
              name: { contains: value, mode: "insensitive" },
            };
            break;
          case "sort":
            switch (value) {
              case "az":
                orderBy = { title: "asc" };
                break;
              case "za":
                orderBy = { title: "desc" };
                break;
              case "id_asc":
                orderBy = { id: "asc" };
                break;
              case "id_desc":
                orderBy = { id: "desc" };
                break;
              case "dl":
                orderBy = { dueDate: "asc" }; // or "desc" if preferred
                break;
            }
            break;
          default:
            break;
        }
    }
  }

  // ROLE CONDITION
  const hasTeacherIdParam = query.lesson.teacherId !== undefined;
  let students: any[] = [];
  switch (role) {
    case "admin":
      break;
    case "teacher":
      if (!hasTeacherIdParam) {
        const teacher = await prisma.teacher.findUnique({
          where: { id: userId! },
          include: { classes: true },
        });

        const classIds = teacher?.classes.map((cls) => cls.id) ?? [];

        query.lesson.classId = {
          in: classIds,
        };
      }
      break;
    case "student":
      query.lesson.class = {
        students: {
          some: {
            id: userId!,
          },
        },
      };
      break;
    case "parent": {
      const children = await prisma.student.findMany({
        where: {
          OR: [
            { parentId: userId! },
            { secondParentId: userId! },
            { guardianId: userId! },
          ],
        },
        select: { classId: true, name: true, id: true },
      });

      const classIds = children
        .map((child) => child.classId)
        .filter((id): id is number => id !== null && id !== undefined);

      if (classIds.length === 0) {
        return (
          <div className="p-8 text-center text-gray-500">
            Tidak ada data kelas anak Anda.
          </div>
        );
      }

      query.lesson.classId = { in: classIds };
      const studentWithAssignments = await Promise.all(
        children.map(async (child) => {
          if (!child.classId)
            return { id: child.id, name: child.name, assignments: [] };

          const lessons = await prisma.lesson.findMany({
            where: { classId: child.classId },
            include: {
              assignments: true,
              subject: true,
              class: true,
              teacher: { select: { name: true, namalengkap: true } },
            },
          });

          const assignments = lessons.flatMap((lesson) =>
            lesson.assignments.map((ass) => ({
              id: ass.id,
              subjectName: lesson.subject?.name || "-",
              className: lesson.class?.name || "-",
              teacherName: lesson.teacher
                ? `${lesson.teacher.name} ${lesson.teacher.namalengkap}`
                : "Tidak ada guru",
              startDate: ass.startDate,
              dueDate: ass.dueDate,
              assTypes: ass.assType,
            }))
          );

          return { id: child.id, name: child.name, assignments };
        })
      );

      students = studentWithAssignments;

      return <ParentAssignmentView students={students} columns={columns} />;
    }
    default:
      break;
  }
  let kelasId: number[] = [];

  if (role === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId! },
      select: {
        classes: { select: { id: true } },
      },
    });

    const supervised = teacher?.classes.map((c) => c.id) || [];
    kelasId = [...new Set([...supervised])];
  }
  const [data, count, assignLessons, ClassAssignment] =
    await prisma.$transaction([
      prisma.assignment.findMany({
        where: query,
        orderBy,
        include: {
          lesson: {
            select: {
              subject: { select: { name: true } },
              teacher: { select: { name: true, namalengkap: true, id: true } },
              class: { select: { name: true, grade: true } },
            },
          },
        },
        take: perPage,
        skip: perPage ? perPage * (p - 1) : undefined,
      }),
      prisma.assignment.count({ where: query }),
      prisma.lesson.findMany({
        where: {
          ...(role === "teacher" ? { teacherId: userId! } : {}),
        },
        select: {
          id: true,
          name: true,
          subject: { select: { name: true } },
          class: { select: { name: true } },
        },
      }),
      prisma.class.findMany({
        where: {
          ...(kelasId.length > 0 ? { id: { in: kelasId } } : {}),
        },
        select: {
          id: true,
          name: true,
          grade: { select: { level: true } },
        },
      }),
    ]);
  const classOptions = ClassAssignment.map((cls) => ({
    label: cls?.name ?? "Unknown Class",
    value: cls?.id?.toString() ?? "", // always string, never undefined
  }));

  const gradeOptions = Array.from(
    new Set(
      ClassAssignment.map((cls) => cls.grade?.level).filter(
        (level): level is number => level !== undefined
      )
    )
  )
    .sort((a, b) => a - b)
    .map((level) => ({
      label: level.toString(),
      value: level, // stays a number
    }));

  const teacherOptions = Array.from(
    new Map(
      data
        .filter((ass) => ass.lesson?.teacher?.id)
        .map((ass) => [
          ass.lesson!.teacher!.id,
          {
            label: ass.lesson!.teacher!.name ?? "Unknown Teacher",
            value: ass.lesson!.teacher!.id.toString(), // always string
          },
        ])
    ).values()
  );
  let relatedData: any = {};
  relatedData = { lessons: assignLessons, kelas2: ClassAssignment };

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">Semua Tugas</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch></TableSearch>
            <div className="flex items-center gap-4 self-end">
              <FilterSortToggle
                filterFields={[
                  {
                    name: "classId",
                    label: "Kelas",
                    options: classOptions,
                  },
                  {
                    name: "gradeId",
                    label: "Tingkat",
                    options: gradeOptions,
                  },
                  {
                    name: "teacherId",
                    label: "Guru",
                    options: teacherOptions,
                  },
                ]}
                sortOptions={[
                  { label: "A-Z", value: "az" },
                  { label: "Z-A", value: "za" },
                  { label: "ID Asc", value: "id_asc" },
                  { label: "ID Desc", value: "id_desc" },
                  { label: "Deadline", value: "dl" },
                ]}
              />
              {(role === "admin" || role === "teacher") && (
                <FormContainer table="assignment" type="create"></FormContainer>
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <AssignmentListClient
            data={data}
            columns={columns}
            role={role!}
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

export default AssignmentListPage;
