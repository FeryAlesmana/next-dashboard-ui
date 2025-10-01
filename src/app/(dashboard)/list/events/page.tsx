import { Semester } from "@/components/client/StudentPaymentView";
import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortToggle from "@/components/FilterSortToggle";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import z from "zod";

type EventList = Event & { class: Class };

const EventListPage = async ({
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
    {
      header: "Nama event",
      accessor: "subjects",
    },
    {
      header: "Kelas",
      accessor: "kelas",
    },
    {
      header: "Tanggal",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    {
      header: "Waktu Mulai",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "Selesai",
      accessor: "endTime",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Aksi",
            accessor: "action",
          },
        ]
      : []),
  ];

  let supervisedClassIds: number[] = [];

  if (role === "teacher") {
    const supervisedClasses = await prisma.class.findMany({
      where: { supervisorId: userId! },
      select: { id: true },
    });

    supervisedClassIds = supervisedClasses.map((cls) => cls.id);
  }

  const renderRow = (item: EventList) => {
    const canEdit =
      role === "admin" ||
      (role === "teacher" && supervisedClassIds.includes(item.classId ?? -1));
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center p-4 gap-4">{item.title}</td>
        <td>{item.class?.name || "-"} </td>
        <td className="hidden md:table-cell">
          {new Intl.DateTimeFormat("en-US").format(item.startTime)}
        </td>
        <td className="hidden md:table-cell">
          {item.startTime.toLocaleTimeString("en-UK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </td>
        <td className="hidden md:table-cell">
          {item.endTime.toLocaleTimeString("en-UK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </td>

        <td>
          <div className="flex items-center gap-2">
            <Link href={`events/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky shadow-md">
                <Image src="/view.png" alt="" width={16} height={16} />
              </button>
            </Link>
            {canEdit && (
              <>
                <FormContainer
                  table="event"
                  type="update"
                  data={item}
                ></FormContainer>
                <FormContainer
                  table="event"
                  type="delete"
                  id={item.id}
                ></FormContainer>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const query: Prisma.EventWhereInput = {};
  let orderBy: Prisma.EventOrderByWithRelationInput | undefined;
  const semesterSchema = z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  });

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "search":
            query.title = { contains: value, mode: "insensitive" };
          case "id":
            query.id = parseInt(value);
          case "classId":
            query.classId = parseInt(value);
            break;
          case "gradeId":
            query.class = { gradeId: parseInt(value) };
            break;
          case "semester":
            try {
              const parsed = semesterSchema.parse(JSON.parse(value as string));
              query.startTime = { gte: new Date(parsed.start) };
              query.endTime = { lte: new Date(parsed.end) };
            } catch {
              query.id = -1; // block tampered values
            }
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
            }
            break;
          default:
            break;
        }
    }
  }

  const generateSemesters = (
    createdAt: Date,
    gradeLevel: number
  ): Semester[] => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Start from either enrollment year OR calculated grade start year
    const startYear = Math.max(
      createdAt.getFullYear(),
      currentYear - (gradeLevel - 1)
    );

    const generated: Semester[] = [];

    for (let year = startYear; year <= currentYear; year++) {
      generated.push({
        label: `Ganjil ${year}/${year + 1}`,
        start: new Date(`${year}-07-01`),
        end: new Date(`${year}-12-31`),
      });
      generated.push({
        label: `Genap ${year}/${year + 1}`,
        start: new Date(`${year + 1}-01-01`),
        end: new Date(`${year + 1}-06-30`),
      });
    }

    return generated.reverse();
  };
  // ROLE CONDITIONS
  let semesters: Semester[] = [];

  if (role === "student") {
    const student = await prisma.student.findUnique({
      where: { id: userId! },
      select: { createdAt: true, grade: { select: { level: true } } },
    });

    if (student) {
      semesters = generateSemesters(
        student.createdAt,
        student.grade?.level ?? 1
      );
    }
  }

  if (role === "parent") {
    const parent = await prisma.parent.findUnique({
      where: { id: userId! },
      select: {
        students: {
          select: { createdAt: true, grade: { select: { level: true } } },
        },
        secondaryStudents: {
          select: { createdAt: true, grade: { select: { level: true } } },
        },
        guardianStudents: {
          select: { createdAt: true, grade: { select: { level: true } } },
        },
      },
    });

    const all = [
      ...(parent?.students || []),
      ...(parent?.secondaryStudents || []),
      ...(parent?.guardianStudents || []),
    ];

    if (all.length > 0) {
      // Pick the child with the **highest grade level**
      const highest = all.reduce((a, b) =>
        (a.grade?.level ?? 0) > (b.grade?.level ?? 0) ? a : b
      );
      semesters = generateSemesters(
        highest.createdAt,
        highest.grade?.level ?? 1
      );
    }
  }

  if (role === "admin") {
    const oldest = await prisma.student.findFirst({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, grade: { select: { level: true } } },
    });

    if (oldest) {
      semesters = generateSemesters(oldest.createdAt, oldest.grade?.level ?? 1);
    }
  }
  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: {
      students: {
        some: {
          OR: [
            { parentId: userId! },
            { secondParentId: userId! },
            { guardianId: userId! },
          ],
        },
      },
    },
  };

  if (role !== "admin") {
    query.OR = [
      { classId: null },
      { class: roleConditions[role as keyof typeof roleConditions] || {} },
    ];
  }

  const [data, count, classes, grades] = await prisma.$transaction([
    prisma.event.findMany({
      orderBy,
      where: query,
      include: {
        class: true,
      },
      take: perPage,
      skip: perPage ? perPage * (p - 1) : undefined,
    }),
    prisma.event.count({ where: query }),
    prisma.class.findMany({}),
    prisma.grade.findMany({
      select: {
        id: true,
        level: true,
      },
    }),
  ]);

  const classOptions = classes.map((cls) => ({
    label: cls?.name ?? "Unknown Class",
    value: cls?.id?.toString() ?? "",
  }));
  const gradeOptions = grades.map((grade) => ({
    label: grade.level.toString(),
    value: grade.id,
  }));

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">Semua Acara</h1>
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
                    name: "semester",
                    label: "Semester",
                    options: semesters.map((sem) => ({
                      label: sem.label,
                      value: JSON.stringify({
                        start: sem.start.toISOString(),
                        end: sem.end.toISOString(),
                      }),
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
                <FormContainer
                  table="announcement"
                  type="create"
                ></FormContainer>
              )}
              {(role === "admin" || role === "teacher") && (
                <FormContainer table="event" type="create"></FormContainer>
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <div className="">
          {data.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Tidak ada Kegiatan.
            </div>
          ) : (
            <Table columns={columns} renderRow={renderRow} data={data} />
          )}
        </div>
        {/* PAGINATION*/}
        <div className="">
          <Pagination page={p} count={count}></Pagination>
        </div>
      </div>
    </ClientPageWrapper>
  );
};

export default EventListPage;
