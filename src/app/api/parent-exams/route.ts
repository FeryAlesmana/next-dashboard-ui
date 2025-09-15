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

  const rawExams = await prisma.exam.findMany({
    where: {
      lesson: { class: { students: { some: { id: studentId } } } },
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    include: {
      lesson: {
        select: {
          subject: { select: { name: true } },
          teacher: { select: { name: true, namalengkap: true } },
          class: { select: { name: true } },
        },
      },
    },
  });
  const exams = rawExams.map((exam) => {
    return {
      id: exam.id,
      subjectName: exam.lesson?.subject?.name || "-",
      className: exam.lesson?.class?.name || "-",
      teacherName: exam.lesson?.teacher
        ? `${exam.lesson.teacher.name} ${exam.lesson.teacher.namalengkap}`
        : "Tidak ada guru",
      date: exam.date,
      startTime: exam.startTime,
      endTime: exam.endTime,
      exType: exam.exType,
    };
  });

  return NextResponse.json({
    id: student.id,
    name: student.name,
    namalengkap: student.namalengkap,
    gradeLevel: student.class?.grade?.level ?? 1,
    exams,
  });
}
