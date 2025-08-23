import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortToggle from "@/components/FilterSortToggle";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ParentResultView from "@/components/client/ParentResultView";
import ResultListClient from "@/components/client/ResultListClient";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { Prisma, resTypes } from "@prisma/client";

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

  const query: Prisma.ResultWhereInput = {};
  let orderBy: Prisma.ResultOrderByWithRelationInput | undefined;

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              {
                assignment: { title: { contains: value, mode: "insensitive" } },
              },
              { student: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          case "classId":
            query.OR = [
              { exam: { lesson: { classId: parseInt(value) } } },
              { assignment: { lesson: { classId: parseInt(value) } } },
            ];
            break;
          case "gradeId":
            query.OR = [
              { exam: { lesson: { class: { gradeId: parseInt(value) } } } },
              {
                assignment: { lesson: { class: { gradeId: parseInt(value) } } },
              },
            ];
            break;
          case "stype":
            if (value === "Ujian") {
              query.examId = { not: null };
            } else if (value === "Tugas") {
              query.assignmentId = { not: null };
            }
            break;
          case "extype":
            switch (value) {
              case "harian":
                query.resultType = "UJIAN_HARIAN";
                break;
              case "uts":
                query.resultType = "UJIAN_TENGAH_SEMESTER";
                break;
              case "uas":
                query.resultType = "UJIAN_AKHIR_SEMESTER";
                break;
              default:
                break;
            }
            break;
          case "asstype":
            switch (value) {
              case "tharian":
                query.resultType = "TUGAS_HARIAN";
                break;
              case "pr":
                query.resultType = "PEKERJAAN_RUMAH";
                break;
              case "ta":
                query.resultType = "TUGAS_AKHIR";
                break;
              default:
                break;
            }
            break;

          case "sort":
            switch (value) {
              case "az":
                orderBy = { student: { name: "asc" } };
                break;
              case "za":
                orderBy = { student: { name: "desc" } };
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
          student: { select: { name: true, namalengkap: true, id: true } },
          exam: {
            include: {
              lesson: {
                select: {
                  class: { select: { name: true } },
                  teacher: { select: { name: true, namalengkap: true } },
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
                  teacher: { select: { name: true, namalengkap: true } },
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
                ? `${lesson.teacher.name} ${lesson.teacher.namalengkap}`
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

  const [dataRes, count, studentData, exams, assignments, classes] =
    await prisma.$transaction([
      prisma.result.findMany({
        where: query,
        include: {
          student: { select: { name: true, namalengkap: true } },
          exam: {
            include: {
              lesson: {
                select: {
                  class: { select: { name: true, gradeId: true } },
                  teacher: { select: { name: true, namalengkap: true } },
                  subject: true,
                },
              },
            },
          },
          assignment: {
            include: {
              lesson: {
                select: {
                  class: { select: { name: true, gradeId: true } },
                  teacher: { select: { name: true, namalengkap: true } },
                  subject: true,
                },
              },
            },
          },
        },
        take: perPage,
        skip: perPage ? perPage * (p - 1) : undefined,
      }),
      prisma.result.count({ where: query }),
      prisma.student.findMany({
        select: {
          id: true,
          name: true,
          namalengkap: true,
          classId: true,
        },
      }),
      prisma.exam.findMany({
        select: {
          id: true,
          title: true,
          lesson: { select: { classId: true } },
        },
      }),
      prisma.assignment.findMany({
        select: {
          id: true,
          title: true,
          lesson: { select: { classId: true } },
        },
      }),
      prisma.class.findMany({
        select: {
          id: true,
          name: true,
          gradeId: true,
        },
      }),
    ]);

  let relatedData = {};

  relatedData = {
    students: studentData,
    exams: exams,
    assignments: assignments,
  };
  const gradesSet = new Set<number>();
  classes.forEach((cls) => gradesSet.add(cls.gradeId!));
  const grades = Array.from(gradesSet).sort((a, b) => a - b);

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
          ? `${item.student.name} ${item.student.namalengkap}`
          : "-",
        teacher: lesson.teacher
          ? `${lesson.teacher.name} ${lesson.teacher.namalengkap}`
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
  const classOptions = classes.map((cls) => ({
    label: cls?.name ?? "Unknown Class",
    value: cls?.id?.toString() ?? "",
  }));
  const gradeOptions = grades.map((level) => ({
    label: level.toString(),
    value: level,
  }));

  let options = {
    classOptions,
    gradeOptions,
  };
  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <ResultListClient
            columns={columns}
            data={data}
            role={role!}
            relatedData={relatedData}
            options={options}
            searchParams={sp}
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

export default ResultListPage;
