import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.emailOtp.create({
    data: { email, code: otp, expiresAt },
  });

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 30px; color: #000;">
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="https://smpiserua.sch.id" target="_blank">
  <img
    src="https://res.cloudinary.com/dbfascepc/image/upload/v1753534026/favicon_iqgit7.png"
    alt="Logo Sekolah"
    height="60"
    style="display:block; margin: 0 auto;"
  />
</a>
      </div>
      <h2 style="text-align: center; font-size: 22px; color: #2d3748;">Kode Verifikasi Sekolah</h2>
      <p style="text-align: center; font-size: 16px;">Gunakan kode di bawah ini untuk verifikasi akun Anda:</p>
      <div style="background-color: #f0f0f0; padding: 16px; border-radius: 8px; text-align: center; font-size: 30px; font-weight: bold; letter-spacing: 4px; margin: 20px auto; width: fit-content;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #555;">Kode ini akan kedaluwarsa dalam 5 menit. Jangan berikan kode ini kepada siapa pun.</p>
      <p style="font-size: 14px; color: #555;">Terima kasih telah menggunakan layanan verifikasi dari sistem sekolah kami.</p>
      <hr style="margin-top: 30px;" />
      <p style="font-size: 12px; color: #888; text-align: center;">
        Email ini dikirim secara otomatis. Jangan balas ke email ini.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Sistem SMP ISLAMIYAH SERUA" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Kode OTP Verifikasi Akun Sekolah",
    html: htmlContent,
  });

  return NextResponse.json({ success: true });
}
