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

  const rawAssignments = await prisma.assignment.findMany({
    where: {
      lesson: { class: { students: { some: { id: studentId } } } },
      dueDate: {
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
  const assignments = rawAssignments.map((ass) => {
    return {
      id: ass.id,
      subjectName: ass.lesson?.subject?.name || "-",
      className: ass.lesson?.class?.name || "-",
      teacherName: ass.lesson?.teacher
        ? `${ass.lesson.teacher.name} ${ass.lesson.teacher.namalengkap}`
        : "Tidak ada guru",
      dueDate: ass.dueDate,
      assType: ass.assType,
    };
  });
  return NextResponse.json({
    id: student.id,
    name: student.name,
    namalengkap: student.namalengkap,
    gradeLevel: student.class?.grade?.level ?? 1,
    assignments,
  });
}
