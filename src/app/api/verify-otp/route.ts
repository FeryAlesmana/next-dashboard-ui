import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json(
      { success: false, error: "Email and OTP required" },
      { status: 400 }
    );
  }

  const record = await prisma.emailOtp.findFirst({
    where: {
      email,
      code: otp,
      expiresAt: {
        gt: new Date(), // Valid if it's still in the future
      },
    },
  });

  if (record) {
    await prisma.emailOtp.delete({ where: { id: record.id } });
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, error: "Invalid or expired OTP" });
  }
}
