import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Prisma, resTypes } from "@prisma/client";
import z from "zod";
import SingleResultPageClient from "@/components/client/SingleResultPageClient";

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
                  meetings: {
                    some: {
                      startTime: {
                        gte: new Date(parsed.start),
                        lte: new Date(parsed.end),
                      },
                    },
                  },
                }
              : undefined, // no filter if no semester
            include: {
              subject: true,
              teacher: true,
            },
          },
          grade: { select: { level: true } },
        },
      },
    },
  });

  if (!student || !student.class || !student.class?.grade?.level)
    return notFound();

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
                    meetings: {
                      some: {
                        startTime: {
                          gte: new Date(parsed.start),
                          lte: new Date(parsed.end),
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              studentId: student.id,
              assignment: {
                is: {
                  lesson: {
                    meetings: {
                      some: {
                        startTime: {
                          gte: new Date(parsed.start),
                          lte: new Date(parsed.end),
                        },
                      },
                    },
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
  const gradeLevel = student.class?.grade?.level;
  // Group results by subject-teacher pair
  const createdAt = student.createdAt;

  return (
    <SingleResultPageClient
      gradeLevel={gradeLevel}
      lessons={lessons}
      results={results}
      student={student}
      createdAt={createdAt}
    />
  );
};

export default SingleResultPage;
