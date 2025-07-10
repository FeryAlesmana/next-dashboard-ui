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
const { role, userId } = await getCurrentUser();
const columns = [
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
    <td className="flex items-center p-4 gap-4">{item.subject.name}</td>
    <td>{item.class.name}</td>
    <td>
      {" "}
      {item.startTime.toLocaleTimeString("en-UK", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
    </td>
    <td>
      {" "}
      {item.endTime.toLocaleTimeString("en-UK", {
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
const LessonListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const sp = normalizeSearchParams(searchParams);
  const { page, ...queryParams } = await sp;
  const p = page ? parseInt(page) : 1;

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
    case "teacher":
      if (!hasTeacherIdParam) {
        const teacher = await prisma.teacher.findUnique({
          where: { id: userId! },
          include: { classes: true },
        });

        const classIds = teacher?.classes.map((cls) => cls.id) ?? [];
        query.classId = { in: classIds };
      }
      break;
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
            parentId: userId!,
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
