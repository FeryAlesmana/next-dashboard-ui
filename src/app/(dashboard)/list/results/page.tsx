import ClientPageWrapper from "@/components/ClientWrapper";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ParentResultView from "@/components/ParentResultView";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { Prisma, resTypes } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

const ResultListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { role, userId } = await getCurrentUser();
  const sp = await normalizeSearchParams(searchParams);
  const key = new URLSearchParams(
    Object.entries(sp).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  const { page, ...queryParams } = sp;
  const p = page ? parseInt(page) : 1;

  const columns = [
    { header: "Pelajaran", accessor: "subject" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Murid", accessor: "Student" }]
      : []),
    { header: "Nilai", accessor: "score" },
    { header: "Guru", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Kelas", accessor: "class" },
    { header: "Tipe", accessor: "type", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Aksi", accessor: "action" }]
      : []),
  ];
  const resultTypelabel = {
    UJIAN_HARIAN: "Ujian Harian",
    UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
    UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
    PEKERJAAN_RUMAH: "Pekerjaan Rumah",
    TUGAS_AKHIR: "Tugas Akhir",
    TUGAS_HARIAN: "Tugas Harian",
  } as const;
  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item?.subject || "-"}</td>
      <td>{item.student}</td>
      <td className="hidden md:table-cell">{item.score}</td>
      <td className="hidden md:table-cell">{item.teacher}</td>
      <td className="hidden md:table-cell">{item.class}</td>
      <td className="hidden md:table-cell">
        {item?.resultType ? resultTypelabel[item?.resultType as resTypes] : "-"}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="result" type="update" data={item} />
              <FormContainer table="result" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined)
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              { student: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
    }
  }
  let students: any[] = [];
  //ROLE CONDITIONS
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: userId! } } },
        { assignment: { lesson: { teacherId: userId! } } },
      ];
      break;
    case "student":
      query.studentId = userId!;
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
        select: { name: true, id: true },
      });

      const studentIds = children.map((child) => child.id);

      if (studentIds.length === 0) {
        return (
          <div className="p-8 text-center text-gray-500">
            Tidak ada data hasil ujian atau tugas anak Anda.
          </div>
        );
      }

      const results = await prisma.result.findMany({
        where: { studentId: { in: studentIds } },
        include: {
          student: { select: { name: true, surname: true, id: true } },
          exam: {
            include: {
              lesson: {
                select: {
                  class: { select: { name: true } },
                  teacher: { select: { name: true, surname: true } },
                  subject: true,
                },
              },
            },
          },
          assignment: {
            include: {
              lesson: {
                select: {
                  class: { select: { name: true } },
                  teacher: { select: { name: true, surname: true } },
                  subject: true,
                },
              },
            },
          },
        },
      });

      const groupedByStudent = children.map((child) => {
        const childResults = results.filter((r) => r.studentId === child.id);

        const mappedResults = childResults
          .map((item) => {
            const source = item.exam ?? item.assignment;
            const lesson = source?.lesson;

            if (!source || !lesson) return null;

            return {
              id: item.id,
              title: source.title,
              subject: lesson.subject?.name || "-",
              teacher: lesson.teacher
                ? `${lesson.teacher.name} ${lesson.teacher.surname}`
                : "-",
              class: lesson.class?.name || "-",
              score: item.score,
              type: item.exam ? "Ujian" : "Tugas",
              resultType: item.resultType ?? null, // ✅ ADD THIS LINE
            };
          })
          .filter(Boolean);

        return {
          id: child.id,
          name: child.name,
          results: mappedResults,
        };
      });

      return (
        <>
          <ParentResultView
            groupedByStudent={groupedByStudent!}
            role={role!}
          ></ParentResultView>
        </>
      );
    }

    default:
      break;
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
                subject: true,
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
                subject: true,
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  const data = dataRes
    .map((item) => {
      const source = item.exam ?? item.assignment;
      const lesson = source?.lesson;

      if (!source || !lesson) return null;

      const isExam = !!item.exam;

      return {
        id: item.id,
        title: source.title,
        subject: lesson.subject?.name || "-",
        studentId: item.studentId || "",
        student: item.student
          ? `${item.student.name} ${item.student.surname}`
          : "-",
        teacher: lesson.teacher
          ? `${lesson.teacher.name} ${lesson.teacher.surname}`
          : "-",
        score: item.score,
        class: lesson.class?.name || "-",
        selectedType: isExam ? "Ujian" : "Tugas",
        examId: item.examId || undefined,
        assignmentId: item.assignmentId || undefined,
        resultType: item.resultType || "",
      };
    })
    .filter(Boolean);
  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">Semua Nilai</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch></TableSearch>
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="" width={14} height={14}></Image>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="" width={14} height={14}></Image>
              </button>
              {(role === "admin" || role === "teacher") && (
                <FormContainer table="result" type="create"></FormContainer>
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

export default ResultListPage;
