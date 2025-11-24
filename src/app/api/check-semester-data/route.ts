import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { semesters } = body as {
      semesters: { start: string; end: string }[];
    };

    const result: any[] = [];

    for (const sem of semesters) {
      const count = await prisma.result.count({
        where: {
          createdAt: {
            gte: new Date(sem.start),
            lte: new Date(sem.end),
          },
        },
      });

      if (count > 0) {
        result.push({ ...sem, count });
      }
    }

    return NextResponse.json({ success: true, semesters: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
