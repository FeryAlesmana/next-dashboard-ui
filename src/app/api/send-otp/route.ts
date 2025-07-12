import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiry (5 minutes)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Save OTP to DB
  await prisma.emailOtp.create({
    data: { email, code: otp, expiresAt },
  });

  // Send email (configure your SMTP credentials)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // or your SMTP host
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER, // set in .env
      pass: process.env.SMTP_PASS, // set in .env
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Kode OTP Verifikasi",
    text: `Kode OTP Anda adalah: ${otp}`,
  });

  return NextResponse.json({ success: true });
}