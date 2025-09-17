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

  const lessons = await prisma.lesson.findMany({
    where: {
      class: { students: { some: { id: studentId } } },
      startTime: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    include: {
      subject: true,
      class: true,
      teacher: { select: { name: true } },
    },
  });

  return NextResponse.json({
    id: student.id,
    name: student.name,
    gradeLevel: student.class?.grade?.level ?? 1,
    lessons,
  });
}
