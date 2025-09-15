import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// ✅ Updated API handler
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!studentId || !startDate || !endDate) {
    return NextResponse.json([], { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      namalengkap: true,
      class: {
        select: {
          grade: {
            select: { level: true },
          },
        },
      },
    },
  });

  if (!student) {
    return NextResponse.json([], { status: 404 });
  }

  const result = await prisma.result.findMany({
    where: {
      studentId,
      OR: [
        {
          exam: {
            lesson: {
              startTime: { gte: new Date(startDate) },
              endTime: { lte: new Date(endDate) },
            },
          },
        },
        {
          assignment: {
            lesson: {
              startTime: { gte: new Date(startDate) },
              endTime: { lte: new Date(endDate) },
            },
          },
        },
      ],
    },
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
    orderBy: { createdAt: "desc" },
  });

  const mappedResults = result
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

  return NextResponse.json({
    id: student.id,
    name: student.name,
    namalengkap: student.namalengkap,
    gradeLevel: student.class?.grade?.level ?? 1,
    results: mappedResults,
  });
}
