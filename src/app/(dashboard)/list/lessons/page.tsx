import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortBar from "@/components/FilterSortBar";
import FilterSortToggle from "@/components/FilterSortToggle";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { Day, Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { LessonWithRelations } from "../attendance/page";

// type LessonList = Lesson & { subject: Subject } & { class: Class } & {
//   teacher: Teacher;
// };

const LessonListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const sp = await normalizeSearchParams(searchParams);
  const { page, ...queryParams } = sp;
  const key = new URLSearchParams(
    Object.entries(sp).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const p = page ? parseInt(page) : 1;

  const { role, userId } = await getCurrentUser();
  const columns = [
    {
      header: "ID Jadwal",
      accessor: "lessonId",
      className: "hidden md:table-cell",
    },
    {
      header: "Mata Pelajaran",
      accessor: "Nama",
    },
    {
      header: "Kelas",
      accessor: "kelas",
      className: "hidden md:table-cell",
    },
    {
      header: "Mulai",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "Berakhir",
      accessor: "endTime",
      className: "hidden md:table-cell",
    },
    {
      header: "Hari",
      accessor: "Day",
    },
    {
      header: "Guru",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Pertemuan",
      accessor: "meeting",
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

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="hidden md:table-cell">{item?.id}</td>
      <td className="flex items-center p-4 gap-4">
        {item.subject?.name || "-"}
      </td>
      <td className="hidden md:table-cell">{item.class.name}</td>
      <td className="hidden md:table-cell">
        {" "}
        {item.startTime.toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td className="hidden md:table-cell">
        {" "}
        {item.endTime.toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td>{item.day}</td>
      <td className="hidden md:table-cell">
        {item.teacher
          ? `${item.teacher.name} ${item.teacher.namalengkap}`
          : "Tidak ada guru"}
      </td>
      <td>
        <Link href={`/list/attendance/${item.class.name}/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full">
            <Image src="/moreDark.png" alt="" width={16} height={16} />
          </button>
        </Link>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer
                table="lesson"
                type="update"
                data={item}
              ></FormContainer>
              <FormContainer
                table="lesson"
                type="delete"
                id={item.id}
              ></FormContainer>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const query: Prisma.LessonWhereInput = {};
  let orderBy: Prisma.LessonOrderByWithRelationInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "teacherId":
            query.teacherId = value.trim();
            console.log("teacherId param:", value);

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

          case "day":
            if (Object.values(Day).includes(value as Day)) {
              query.day = value as Day;
            }
            break;
          case "search":
            query.OR = [
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
              { class: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          case "sort":
            switch (value) {
              case "az":
                orderBy = { subject: { name: "asc" } };
                break;
              case "za":
                orderBy = { subject: { name: "desc" } };
                break;
              case "id_asc":
                orderBy = { id: "asc" };
                break;
              case "id_desc":
                orderBy = { id: "desc" };
                break;
              case "day":
                orderBy = { day: "asc" }; // or "desc" if preferred
                break;
            }
            break;
          default:
            break;
        }
    }
  }
  // ROLE CONDITION

  const hasTeacherIdParam = query.teacherId !== undefined;
  let lessons: LessonWithRelations[] = [];
  let students: any[] = [];
  switch (role) {
    case "admin":
      break;
    case "teacher": {
      if (!hasTeacherIdParam) {
        const teacher = await prisma.teacher.findUnique({
          where: { id: userId! },
          include: { classes: { select: { id: true, name: true } } },
        });

        // Fetch supervised classes directly
        const supervisedClasses = teacher?.classes || [];
        const supervisedClassesWithLessons = await Promise.all(
          supervisedClasses.map(async (cls) => {
            const lessons = await prisma.lesson.findMany({
              where: { classId: cls.id },
              include: {
                subject: { select: { name: true } },
                teacher: { select: { name: true, namalengkap: true } },
              },
            });
            return { ...cls, lessons };
          })
        );
        // Fetch teaching lessons separately
        const [teachingLessons, lessonCount] = await prisma.$transaction([
          prisma.lesson.findMany({
            where: { teacherId: userId! },
            include: {
              subject: { select: { name: true } },
              class: { select: { name: true, gradeId: true } },
              teacher: { select: { name: true, namalengkap: true } },
            },
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
          }),
          prisma.lesson.count({ where: { teacherId: userId! } }),
        ]);

        return (
          <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <h1 className="text-lg font-semibold mb-4">Jadwal Guru</h1>

            {/* Supervised Classes */}
            <div className="mb-8">
              <h2 className="text-md font-semibold mb-2">
                Jadwal Kelas yang Disupervisi
              </h2>

              {supervisedClassesWithLessons.length > 0 ? (
                supervisedClassesWithLessons.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-4 rounded-md border mb-6 bg-gray-50"
                  >
                    <h3 className="font-semibold mb-3 text-lamaPurple">
                      {cls.name}
                    </h3>

                    {cls.lessons.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="p-2 text-left">Mata Pelajaran</th>
                            <th className="p-2 text-left">Hari</th>
                            <th className="p-2 text-left">Jam</th>
                            <th className="p-2 text-left">Guru</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cls.lessons.map((lesson) => (
                            <tr key={lesson.id} className="border-t">
                              <td className="p-2">
                                {lesson.subject?.name || "-"}
                              </td>
                              <td className="p-2">{lesson.day}</td>
                              <td className="p-2">
                                {lesson.startTime.toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                -{" "}
                                {lesson.endTime.toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="p-2">
                                {lesson.teacher
                                  ? `${lesson.teacher.name} ${lesson.teacher.namalengkap}`
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        Tidak ada jadwal ditemukan.
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">
                  Anda tidak mengawasi kelas manapun.
                </div>
              )}
            </div>

            {/* Teaching Lessons */}
            <div className="mb-8">
              <h2 className="text-md font-semibold mb-2">
                Jadwal Mengajar Guru
              </h2>
              <Table
                columns={columns}
                renderRow={renderRow}
                data={teachingLessons}
              ></Table>
              <Pagination page={p} count={lessonCount} />
            </div>
          </div>
        );
      }
      break;
    }
    case "student":
      query.class = {
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

      query.classId = { in: classIds };

      const studentsWithLessons = await Promise.all(
        children.map(async (child) => {
          const lessons = child.classId
            ? await prisma.lesson.findMany({
                where: { classId: child.classId },
                include: {
                  subject: true,
                  class: true,
                  teacher: { select: { name: true, namalengkap: true } },
                },
              })
            : [];

          return { id: child.id, name: child.name, lessons };
        })
      );

      students = studentsWithLessons;
      const parentLessons = studentsWithLessons.flatMap((student) =>
        student.lessons.map((lesson) => ({
          ...lesson,
          studentName: student.name, // optional if you want to display child name
        }))
      );

      return (
        <div className="w-full mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Jadwal Anak</h1>

          {studentsWithLessons.length === 0 ? (
            <div className="text-center text-gray-500">
              Tidak ada jadwal tersedia untuk anak Anda.
            </div>
          ) : (
            studentsWithLessons.map((student) => (
              <div key={student.id} className="mb-12">
                <h2 className="text-xl font-semibold mb-4">{student.name}</h2>

                {student.lessons.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Tidak ada jadwal untuk {student.name}.
                  </div>
                ) : (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          {columns.map((col) => (
                            <th
                              key={col.accessor}
                              className={`px-4 py-3 font-semibold text-center ${
                                col.className ?? ""
                              }`}
                            >
                              {col.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100 text-center">
                        {student.lessons.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
                          >
                            <td className="hidden md:table-cell">{item?.id}</td>
                            <td className="flex items-center p-4 gap-4">
                              {item.subject?.name || "-"}
                            </td>
                            <td className="hidden md:table-cell">
                              {item.class?.name}
                            </td>
                            <td className="hidden md:table-cell">
                              {item.startTime?.toLocaleTimeString("id-ID", {
                                timeZone: "Asia/Jakarta",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })}
                            </td>
                            <td className="hidden md:table-cell">
                              {item.endTime?.toLocaleTimeString("id-ID", {
                                timeZone: "Asia/Jakarta",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })}
                            </td>
                            <td>{item.day}</td>
                            <td className="hidden md:table-cell">
                              {item.teacherId
                                ? `${item.teacher?.name} ${item.teacher?.namalengkap}`
                                : "Tidak ada guru"}
                            </td>
                            <td>
                              <Link
                                href={`/list/attendance/${item.class?.name}/${item.id}`}
                              >
                                <button className="w-7 h-7 items-center justify-center rounded-full">
                                  <Image
                                    src="/moreDark.png"
                                    alt=""
                                    width={16}
                                    height={16}
                                  />
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      );
    }
    default:
      break;
  }

  const [data, count, classesData] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      orderBy,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true, gradeId: true } },
        teacher: { select: { name: true, namalengkap: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: query }),
    prisma.class.findMany({
      include: { grade: true, _count: { select: { students: true } } },
    }),
  ]);

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">Jadwal {}</h1>
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
                  {
                    name: "day",
                    label: "Hari",
                    options: [
                      { label: "Senin", value: "SENIN" },
                      { label: "Selasa", value: "SELASA" },
                      { label: "Rabu", value: "RABU" },
                      { label: "Kamis", value: "KAMIS" },
                      { label: "Jumat", value: "JUMAT" },
                      // Add more as needed
                    ],
                  },
                ]}
                sortOptions={[
                  { label: "A-Z", value: "az" },
                  { label: "Z-A", value: "za" },
                  { label: "ID Asc", value: "id_asc" },
                  { label: "ID Desc", value: "id_desc" },
                  { label: "Day", value: "day" }, // Only for this page
                ]}
              />
              {role === "admin" && (
                <FormContainer table="lesson" type="create"></FormContainer>
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <div className="">
          <Table columns={columns} renderRow={renderRow} data={data}></Table>
        </div>
        {/* PAGINATION*/}
        <div className="">
          <Pagination page={p} count={count}></Pagination>
        </div>
      </div>
    </ClientPageWrapper>
  );
};

export default LessonListPage;
