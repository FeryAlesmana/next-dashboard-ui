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
      <h2 style="text-align: center; color: #333;">Notifikasi PPDB Sekolah</h2>
      <p style="font-size: 16px; margin-top: 20px;">
        ${message.replace(/\n/g, "<br />")}
      </p>
      <div style="margin-top: 40px; font-size: 14px; color: #555;">
        <p>Terima kasih,</p>
        <p><strong>Panitia PPDB SMP ISLAMIYAH SERUA</strong></p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"PPDB Sekolah" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Notifikasi Formulir PPDB",
      html: htmlContent,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json(
      { error: "Gagal mengirim email." },
      { status: 500 }
    );
  }
}
