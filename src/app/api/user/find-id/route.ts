import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clerkId = searchParams.get("clerkId");

  if (!clerkId) {
    return NextResponse.json({ error: "clerkId is required" }, { status: 400 });
  }

  try {
    // 1. Check Clerk first for Admin status
    const client = await clerkClient();
    const user = await client.users.getUser(clerkId);

    // If metadata says admin, return immediately (Admin doesn't need a DB ID)
    if (user.publicMetadata?.role === "admin") {
      return NextResponse.json({ id: clerkId, role: "admin" });
    }
    // Search all models in parallel
    const [student, teacher, parent, staff] = await Promise.all([
      prisma.student.findUnique({ where: { clerkId }, select: { id: true } }),
      prisma.teacher.findUnique({ where: { clerkId }, select: { id: true } }),
      prisma.parent.findUnique({ where: { clerkId }, select: { id: true } }),
      prisma.staff.findUnique({ where: { clerkId }, select: { id: true } }),
    ]);

    if (student) return NextResponse.json({ id: student.id, role: "student" });
    if (teacher) return NextResponse.json({ id: teacher.id, role: "teacher" });
    if (parent) return NextResponse.json({ id: parent.id, role: "parent" });
    if (staff) return NextResponse.json({ id: staff.id, role: "staff" });

    return NextResponse.json({ error: "User not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
