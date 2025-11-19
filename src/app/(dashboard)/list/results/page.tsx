import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortToggle from "@/components/FilterSortToggle";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ParentResultView from "@/components/client/ParentResultView";
import ResultListClient from "@/components/client/ResultListClient";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import {
  generateSemesters,
  getCurrentUser,
  normalizeSearchParams,
} from "@/lib/utils";
import { Prisma, resTypes } from "@prisma/client";
import StudentResultView from "@/components/client/StudentResultView";
import ParentLessonViewSemester from "@/components/client/ParentLessonViewSemester";
import ParentResultViewSemester from "@/components/client/ParentResultViewSemester";
import z from "zod";

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
  const perPage = limit === "all" ? 50 : parseInt(limit ?? "10");

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
      header: "Pelajaran",
      accessor: "subject",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Murid", accessor: "Student" }]
      : []),
    { header: "Nilai", accessor: "score" },
    { header: "Guru", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Kelas", accessor: "class", className: "hidden md:table-cell" },
    { header: "Tipe", accessor: "type", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Aksi", accessor: "action" }]
      : []),
  ];

  const query: Prisma.ResultWhereInput = {};
  let orderBy: Prisma.ResultOrderByWithRelationInput | undefined;
  const semesterSchema = z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  });
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
          case "semester":
            try {
              const parsed = semesterSchema.parse(JSON.parse(value as string));

              query.OR = [
                {
                  exam: {
                    lesson: {
                      startTime: { gte: new Date(parsed.start) },
                      endTime: { lte: new Date(parsed.end) },
                    },
                  },
                },
                {
                  assignment: {
                    lesson: {
                      startTime: { gte: new Date(parsed.start) },
                      endTime: { lte: new Date(parsed.end) },
                    },
                  },
                },
              ];
            } catch (e) {
              query.id = -1; // block tampered values
            }
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
  let gradeLevel = 3;
  let semesterOptions: any = [];
  switch (role) {
    case "admin":
      const oldest = await prisma.student.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true, grade: { select: { level: true } } },
      });

      const highest = await prisma.grade.aggregate({
        _max: { level: true },
      });
      if (oldest) {
        semesterOptions = generateSemesters(
          oldest.createdAt,
          highest._max.level ?? 3,
          role
        );
      }
      break;
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: userId! } } },
        { assignment: { lesson: { teacherId: userId! } } },
      ];
      const teacher = await prisma.teacher.findUnique({
        where: { id: userId! },
        select: {
          classes: {
            select: {
              students: {
                select: { createdAt: true, grade: { select: { level: true } } },
              },
            },
          },
        },
      });

      const Murid = teacher?.classes.flatMap((kelas) => kelas.students) ?? [];
      if (Murid.length > 0) {
        const highest = Murid.reduce((a, b) =>
          (a.grade?.level ?? 0) > (b.grade?.level ?? 0) ? a : b
        );

        semesterOptions = generateSemesters(
          highest.createdAt,
          highest.grade?.level ?? 1,
          role
        );
      }
      break;
    case "student": {
      const results = await prisma.result.findMany({
        where: { studentId: userId! },
        include: {
          exam: {
            include: {
              lesson: {
                select: {
                  class: { select: { name: true } },
                  teacher: { select: { name: true } },
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
                  teacher: { select: { name: true } },
                  subject: true,
                },
              },
            },
          },
        },
      });

      const mappedResults = results
        .map((item) => {
          const source = item.exam ?? item.assignment;
          const lesson = source?.lesson;

          if (!source || !lesson) return null;

          return {
            id: item.id,
            title: source.title,
            subject: lesson.subject?.name || "-",
            teacher: lesson.teacher ? `${lesson.teacher.name} ` : "-",
            class: lesson.class?.name || "-",
            score: item.score,
            type: item.exam ? "Ujian" : "Tugas",
            resultType: item.resultType ?? null,
          };
        })
        .filter(Boolean);

      return <StudentResultView results={mappedResults} />;
    }

    case "parent": {
      const children = await prisma.student.findMany({
        where: {
          OR: [
            { parentId: userId! },
            { secondParentId: userId! },
            { guardianId: userId! },
          ],
        },
        select: {
          name: true,
          id: true,
          class: {
            select: { name: true, grade: { select: { level: true } } },
          },
          createdAt: true,
        },
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
          student: { select: { name: true, id: true } },
          exam: {
            include: {
              lesson: {
                select: {
                  class: { select: { name: true } },
                  teacher: { select: { name: true } },
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
                  teacher: { select: { name: true } },
                  subject: true,
                },
              },
            },
          },
        },
      });

      const studentsWithResults = await Promise.all(
        children.map(async (child) => {
          const results = await prisma.result.findMany({
            where: { studentId: child.id },
            include: {
              student: { select: { name: true, id: true } },
              exam: {
                include: {
                  lesson: {
                    select: {
                      class: { select: { name: true } },
                      teacher: { select: { name: true } },
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
                      teacher: { select: { name: true } },
                      subject: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          });
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
                teacher: lesson.teacher ? `${lesson.teacher.name} ` : "-",
                class: lesson.class?.name || "-",
                score: item.score,
                type: item.exam ? "Ujian" : "Tugas",
                resultType: item.resultType ?? null, // ✅ ADD THIS LINE
              };
            })
            .filter(Boolean);
          return {
            ...child,
            results: mappedResults,
          };
        })
      );

      return (
        <>
          <ParentResultViewSemester
            gradeLevel={studentsWithResults.map((s) => ({
              studentId: s.id,
              gradeLevel: s.class?.grade?.level,
              createdAt: s.createdAt,
            }))}
            userId={userId!}
          />
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
          student: { select: { name: true } },
          exam: {
            include: {
              lesson: {
                select: {
                  class: { select: { name: true, gradeId: true } },
                  teacher: { select: { name: true } },
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
                  teacher: { select: { name: true } },
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
        student: item.student ? `${item.student.name}` : "-",
        teacher: lesson.teacher ? `${lesson.teacher.name} ` : "-",
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
    semesterOptions,
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
            gradeLevel={gradeLevel}
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
