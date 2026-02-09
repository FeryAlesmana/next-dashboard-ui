export const runtime = "nodejs";

import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import puppeteer from "puppeteer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const studentId = searchParams.get("studentId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!studentId || !start || !end) {
    return new NextResponse("Missing parameters", { status: 400 });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  const payments = await prisma.paymentLog.findMany({
    where: {
      studentId,
      status: "PAID",
      paidAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      student: true,
      class: true,
      grade: true,
    },
    orderBy: { paidAt: "asc" },
  });

  if (!payments.length) {
    return new NextResponse("No payments found", { status: 404 });
  }

  const student = payments[0].student;
  const className = payments[0].class?.name ?? "-";
  const gradeLevel = payments[0].grade?.level ?? "-";

  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const PAYMENT_TYPE_LABEL: Record<string, string> = {
    TUITION: "SPP",
    EXTRACURRICULAR: "Ekstrakurikuler",
    UNIFORM: "Seragam",
    BOOKS: "Buku",
    OTHER: "Lainnya",
  };

  const michroma = fs
    .readFileSync(path.join(process.cwd(), "public/fonts/Michroma-Regular.ttf"))
    .toString("base64");

  const trajan = fs
    .readFileSync(
      path.join(process.cwd(), "public/fonts/Cinzel-VariableFont_wght.ttf"),
    )
    .toString("base64");

  const rows = payments
    .map((p, i) => {
      const paidAt = p.paidAt ? new Date(p.paidAt) : null;
      const dueDate = p.dueDate ? new Date(p.dueDate) : null;

      const isLate = paidAt && dueDate && paidAt.getTime() > dueDate.getTime();

      const paidAtText = paidAt
        ? `${paidAt.toLocaleDateString("id-ID")}${isLate ? " (Telat)" : ""}`
        : "-";

      return `
    <tr>
      <td>${i + 1}</td>
      <td>${PAYMENT_TYPE_LABEL[p.paymentType] ?? p.paymentType}</td>
      <td>${p.description ?? "-"}</td>
      <td>${paidAtText}</td>
      <td>Rp ${Number(p.amount).toLocaleString("id-ID")}</td>
    </tr>
  `;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
@font-face {
  font-family: "Michroma";
  src: url("data:font/ttf;base64,${michroma}") format("truetype");
}

@font-face {
  font-family: "Trajan";
  src: url("data:font/ttf;base64,${trajan}") format("truetype");
}

body {
  font-size: 12px;
  margin: 40px;
  color: #111;
}

.kop {
  display: grid;
  grid-template-columns: 100px 1fr;
  column-gap: 16px;
  align-items: center;
}

.logo {
  width: 90px;
}

.kop-text {
  text-align: center;
}

.yayasan,
.school-level,
.akreditasi {
  font-family: "Michroma", sans-serif;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.school-name {
  font-family: "Trajan", serif;
  font-size: 26px;
  letter-spacing: 2px;
  margin: 6px 0;
  color: #1f3a8a;
}

.double-line {
  margin-top: 10px;
  border-top: 3px solid #000;
  position: relative;
}
.double-line::after {
  content: "";
  position: absolute;
  top: 6px;
  width: 100%;
  border-top: 1px solid #000;
}

.title {
  margin: 24px 0;
  text-align: center;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
}

.meta p {
  margin: 4px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

th, td {
  border: 1px solid #333;
  padding: 8px;
  font-size: 11px;
}

th {
  background: #f3f4f6;
}

tfoot td {
  font-weight: bold;
}

.footer {
  margin-top: 48px;
  display: flex;
  justify-content: space-between;
}
</style>
</head>

<body>

<div class="kop">
  <img class="logo" src="https://res.cloudinary.com/dbfascepc/image/upload/v1753534026/favicon_iqgit7.png" />
  <div class="kop-text">
    <div class="yayasan">Yayasan Wiyata Mandala Muslimin Indonesia (YADAMI)</div>
    <div class="school-level">Sekolah Menengah Pertama Islamiyah</div>
    <div class="school-name">SMP ISLAMIYAH SERUA</div>
    <div class="akreditasi">Terakreditasi B</div>
  </div>
</div>

<div class="double-line"></div>

<div class="title">Rekap Pembayaran Semester</div>

<div class="meta">
  <p><strong>Nama Siswa</strong>: ${student.name}</p>
  <p><strong>Kelas</strong>: ${className} / Tingkat ${gradeLevel}</p>
  <p><strong>Periode</strong>: ${startDate.toLocaleDateString("id-ID")} – ${endDate.toLocaleDateString("id-ID")}</p>
</div>

<table>
<thead>
<tr>
  <th>No</th>
  <th>Jenis</th>
  <th>Keterangan</th>
  <th>Tanggal dibayar</th>
  <th>Jumlah</th>
</tr>
</thead>

<tbody>
${rows}
</tbody>

<tfoot>
<tr>
  <td colspan="4" style="text-align:right">Total</td>
  <td>Rp ${totalAmount.toLocaleString("id-ID")}</td>
</tr>
</tfoot>
</table>

<div class="footer">
  <div>Status: <strong>LUNAS</strong></div>
  <div style="text-align:center">
    <p>Bagian Keuangan</p><br /><br />
    <p>(___________________)</p>
  </div>
</div>

</body>
</html>
`;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
  });

  await browser.close();

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=rekap-pembayaran-${student.name}.pdf`,
    },
  });
}
