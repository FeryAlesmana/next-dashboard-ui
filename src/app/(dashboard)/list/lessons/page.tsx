import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

// type LessonList = Lesson & { subject: Subject } & { class: Class } & {
//   teacher: Teacher;
// };

const LessonListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const sp = normalizeSearchParams(searchParams);
  const { page, ...queryParams } = await sp;
  const p = page ? parseInt(page) : 1;

  const { role, userId } = await getCurrentUser();
  const columns = [
    {
      header: "ID Jadwal",
      accessor: "lessonId",
    },
    {
      header: "Mata Pelajaran",
      accessor: "Nama",
    },
    {
      header: "Kelas",
      accessor: "kelas",
    },
    {
      header: "Mulai",
      accessor: "startTime",
    },
    {
      header: "Berakhir",
      accessor: "endTime",
    },
    {
      header: "Hari",
      accessor: "Day",
    },
    {
      header: "Teacher",
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
      <td>{item?.id}</td>
      <td className="flex items-center p-4 gap-4">
        {item.subject?.name || "-"}
      </td>
      <td>{item.class.name}</td>
      <td>
        {" "}
        {item.startTime.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td>
        {" "}
        {item.endTime.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td>{item.day}</td>
      <td className="hidden md:table-cell">
        {item.teacher
          ? `${item.teacher.name} ${item.teacher.surname}`
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

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined)
        switch (key) {
          case "teacherId":
            query.teacherId = value.trim();
            console.log("teacherId param:", value);

            break;
          case "classId":
            query.classId = parseInt(value);
            break;
          case "search":
            query.OR = [
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
    }
  }
  // ROLE CONDITION

  const hasTeacherIdParam = query.teacherId !== undefined;
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
                teacher: { select: { name: true, surname: true } },
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
              class: { select: { name: true } },
              teacher: { select: { name: true, surname: true } },
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
                                  ? `${lesson.teacher.name} ${lesson.teacher.surname}`
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
    case "parent":
      query.class = {
        students: {
          some: {
            OR: [
              { parentId: userId! },
              { secondParentId: userId! },
              { guardianId: userId! },
            ],
          },
        },
      };
      break;
    default:
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Jadwal {}</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch></TableSearch>
          <div className="flex items-center gap-4 self-end">
            <Link href={`/list/lessons?teacherId=${userId!}`}>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="" width={14} height={14} />
              </button>
            </Link>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14}></Image>
            </button>
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
  );
};

export default LessonListPage;
