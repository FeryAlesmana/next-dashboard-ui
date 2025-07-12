import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  if (!email || !otp) {
    return NextResponse.json({ success: false, error: "Email and OTP required" }, { status: 400 });
  }

  // Find OTP record
  const record = await prisma.emailOtp.findFirst({
    where: {
      email,
      code: otp,
      expiresAt: { gte: new Date() }, // not expired
    },
  });

  if (record) {
    // Optionally, delete OTP after use
    await prisma.emailOtp.delete({ where: { id: record.id } });
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false });
  }
}
