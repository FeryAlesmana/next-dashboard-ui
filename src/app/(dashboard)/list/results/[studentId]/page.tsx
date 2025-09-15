import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Prisma, resTypes } from "@prisma/client";
import PrintButton from "@/components/PrintButton";
import z from "zod";
import SingleResultPageClient from "@/components/client/SingleResultPageClient";

const resultTypelabel = {
  UJIAN_HARIAN: "Ujian Harian",
  UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
  UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
  PEKERJAAN_RUMAH: "Pekerjaan Rumah",
  TUGAS_AKHIR: "Tugas Akhir",
  TUGAS_HARIAN: "Tugas Harian",
} as const;

const getScore = (
  results: any[],
  lessonId: number,
  types: resTypes[]
): number => {
  const matching = results.filter((res) => {
    const source = res.exam ?? res.assignment;
    return source?.lessonId === lessonId && types.includes(res.resultType);
  });
  if (matching.length === 0) return 0;
  const total = matching.reduce((sum, res) => sum + (res.score ?? 0), 0);
  return Math.round(total / matching.length);
};

const SingleResultPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { role } = await getCurrentUser();
  if (role === undefined) return notFound();
  const sp = await normalizeSearchParams(searchParams);
  const { ...queryParams } = sp;
  const { studentId } = await params;
  const semesterSchema = z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  });

  // 🔹 parse semester here once
  let parsed: { start: string; end: string } | null = null;
  if (queryParams.semester) {
    try {
      parsed = semesterSchema.parse(JSON.parse(queryParams.semester as string));
    } catch (e) {
      parsed = null;
    }
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      student_details: { select: { nisn: true } },
      class: {
        include: {
          lessons: {
            where: parsed
              ? {
                  startTime: { gte: new Date(parsed.start) },
                  endTime: { lte: new Date(parsed.end) },
                }
              : undefined, // no filter if no semester
            include: {
              subject: true,
              teacher: true,
            },
          },
        },
      },
      grade: { select: { level: true } },
    },
  });

  if (!student || !student.class || !student.grade) return notFound();

  const query: Prisma.ResultWhereInput = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "") {
        if (parsed) {
          query.OR = [
            {
              studentId: student.id,
              exam: {
                is: {
                  lesson: {
                    startTime: { gte: new Date(parsed.start) },
                    endTime: { lte: new Date(parsed.end) },
                  },
                },
              },
            },
            {
              studentId: student.id,
              assignment: {
                is: {
                  lesson: {
                    startTime: { gte: new Date(parsed.start) },
                    endTime: { lte: new Date(parsed.end) },
                  },
                },
              },
            },
          ];
        }
      }
    }
  }
  const results = await prisma.result.findMany({
    where: query,
    include: {
      exam: { include: { lesson: true } },
      assignment: { include: { lesson: true } },
    },
  });

  const lessons = student.class.lessons;
  const gradeLevel = student.grade.level;
  // Group results by subject-teacher pair
  const groupedResults = new Map<
    string,
    {
      subjectName: string;
      teacherName: string;
      tugas: number;
      uts: number;
      uas: number;
      avg: number;
    }
  >();

  return (
    <SingleResultPageClient
      gradeLevel={gradeLevel}
      lessons={lessons}
      results={results}
      student={student}
    />
  );
};

export default SingleResultPage;
