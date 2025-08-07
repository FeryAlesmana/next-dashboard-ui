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
      surname: true,
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

  const payments = await prisma.paymentLog.findMany({
    where: {
      studentId,
      dueDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
  });

  return NextResponse.json({
    id: student.id,
    name: student.name,
    surname: student.surname,
    gradeLevel: student.class?.grade?.level ?? 1,
    payments,
  });
}
