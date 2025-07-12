import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email, message } = await req.json();

  if (!email || !message) {
    return NextResponse.json(
      { error: "Email dan pesan wajib diisi." },
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Feedback PPDB",
      text: message,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengirim email." },
      { status: 500 }
    );
  }
}
