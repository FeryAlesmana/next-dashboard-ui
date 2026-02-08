export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import puppeteer from "puppeteer";

type Params = {
  params: Promise<{
    id: string;
  }>;
};
export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const paymentId = parseInt(id);

  const payment = await prisma.paymentLog.findUnique({
    where: { id: paymentId },
    include: {
      student: true,
      class: true,
      grade: true,
      paymentInstallments: true,
    },
  });

  if (!payment) {
    return new NextResponse("Payment not found", { status: 404 });
  }

  if (payment.status !== "PAID") {
    return new NextResponse("Payment not completed", { status: 403 });
  }

  const totalPaid = payment.paymentInstallments.length
    ? payment.paymentInstallments.reduce((sum, i) => sum + Number(i.amount), 0)
    : Number(payment.amount);

  const paidDate = payment.paidAt?.toLocaleDateString("id-ID") ?? "-";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: "Inter", Arial, sans-serif;
      font-size: 12px;
      color: #111;
      margin: 40px;
    }

    .header {
      display: flex;
      align-items: center;
      border-bottom: 2px solid #222;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }

    .logo {
      width: 70px;
      margin-right: 16px;
    }

    .school-info {
      flex: 1;
    }

    .school-info h1 {
      font-size: 16px;
      margin: 0;
    }

    .school-info p {
      margin: 2px 0;
      font-size: 11px;
    }

    .title {
      text-align: center;
      font-weight: 700;
      font-size: 14px;
      margin: 24px 0;
      text-transform: uppercase;
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
      text-align: left;
    }

    .meta {
      margin-top: 12px;
      font-size: 11px;
    }

    .meta strong {
      display: inline-block;
      width: 120px;
    }

    .footer {
      margin-top: 48px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
    }

    .signature {
      text-align: center;
      margin-top: 48px;
    }
  </style>
</head>
<body>

  <div class="header">
    <img class="logo" src="https://res.cloudinary.com/dbfascepc/image/upload/v1753534026/favicon_iqgit7.png" />
    <div class="school-info">
      <h1>SMP Islamiyah Serua</h1>
      <p>Bukti Pembayaran Resmi</p>
    </div>
  </div>

  <div class="title">Bukti Pembayaran</div>

  <div class="meta">
    <p><strong>Nama Siswa</strong>: ${payment.student.name}</p>
    <p><strong>Kelas</strong>: ${payment.class?.name ?? "-"} Tingkat : ${payment.grade?.level ?? ""}</p>
    <p><strong>Jenis Pembayaran</strong>: ${payment.paymentType}</p>
    <p><strong>No. Kwitansi</strong>: ${payment.receiptNumber ?? "-"}</p>
    <p><strong>Tanggal Bayar</strong>: ${paidDate}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Keterangan</th>
        <th>Jumlah</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${payment.description ?? "Pembayaran"}</td>
        <td>Rp ${totalPaid.toLocaleString("id-ID")}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>
      <p>Status: <strong>LUNAS</strong></p>
    </div>
    <div class="signature">
      <p>Bagian Keuangan</p>
      <br /><br />
      <p>(____________________)</p>
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
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "20mm",
      right: "20mm",
    },
  });

  await browser.close();

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=receipt-${payment.id}.pdf`,
    },
  });
}
