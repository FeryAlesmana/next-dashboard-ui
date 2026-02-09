export const runtime = "nodejs";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import puppeteer from "puppeteer";
import { formatDate } from "date-fns";

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
  const michroma = fs
    .readFileSync(path.join(process.cwd(), "public/fonts/Michroma-Regular.ttf"))
    .toString("base64");

  const trajan = fs
    .readFileSync(
      path.join(process.cwd(), "public/fonts/Cinzel-VariableFont_wght.ttf"),
    )
    .toString("base64");

  const PAYMENT_TYPE_LABEL: Record<string, string> = {
    TUITION: "SPP",
    EXTRACURRICULAR: "Ekstrakurikuler",
    UNIFORM: "Seragam",
    BOOKS: "Buku",
    OTHER: "Lainnya",
  };

  const normalizedPaymentType =
    PAYMENT_TYPE_LABEL[payment.paymentType] ?? payment.paymentType;

  const isLatePayment = (pay: any) => {
    if (!pay.paidAt) return false;

    return new Date(pay.paidAt) > new Date(pay.dueDate);
  };

  const late = isLatePayment(payment);

  const statusLabel = late ? "Lunas (Dibayar Terlambat)" : "Lunas";

  const explanation = late
    ? `Pembayaran dilakukan pada ${formatDate(
        new Date(payment.paidAt!),
        "dd MMMM yyyy",
      )},
     setelah tanggal jatuh tempo ${formatDate(
       new Date(payment.dueDate!),
       "dd MMMM yyyy",
     )}.`
    : "Pembayaran dilakukan sebelum atau tepat pada jatuh tempo.";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @font-face {
      font-family: "Michroma";
      src: url("data:font/ttf;base64,${michroma}") format("truetype");
      font-weight: normal;
      font-style: normal;
    }

    @font-face {
      font-family: "Trajan";
      src: url("data:font/ttf;base64,${trajan}") format("truetype");
      font-weight: normal;
      font-style: normal;
    }

    body {
      font-size: 12px;
      margin: 40px;
      color: #111;
    }

    .kop {
      display: grid;
      grid-template-columns: 100px 1fr;
      align-items: center;
      column-gap: 16px;
    }

    .logo {
      width: 90px;
      height: auto;
    }

    .kop-text {
      width: 100%;
      text-align: center; /* text centered INSIDE the full-width block */
    }
    
    .yayasan,
    .school-level,
    .akreditasi {
      font-family: "Michroma", sans-serif;
      text-transform: uppercase;
      letter-spacing: 1.2px;
    }

    .yayasan {
      font-size: 10.5px;
    }

    .school-level {
      font-size: 12px;
      font-weight: 600;
    }

    .school-name {
      font-family: "Trajan", serif;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 2px;
      margin: 6px 0;
      color: #1f3a8a;
    }

    .akreditasi {
      font-size: 10.5px;
      color: #b91c1c;
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
      left: 0;
      width: 100%;
      border-top: 1px solid #000;
    }


    .header {
      display: flex;
      align-items: center;
      border-bottom: 2px solid #222;
      padding-bottom: 12px;
      margin-bottom: 24px;
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

  <div class="kop">
    <img
      class="logo"
      src="https://res.cloudinary.com/dbfascepc/image/upload/v1753534026/favicon_iqgit7.png"
    />

    <div class="kop-text">
      <div class="yayasan">
        Yayasan Wiyata Mandala Muslimin Indonesia (YADAMI)
      </div>

      <div class="school-level">
        SEKOLAH MENENGAH PERTAMA ISLAMIYAH
      </div>

      <div class="school-name">
        SMP ISLAMIYAH SERUA
      </div>

      <div class="akreditasi">
        TERAKREDITASI B
      </div>
    </div>
  </div>

  <div class="double-line"></div>


  <div class="title">Bukti Pembayaran</div>

  <div class="meta">
    <p><strong>Nama Siswa</strong>: ${payment.student.name}</p>
    <p><strong>Kelas</strong>: ${payment.class?.name ?? "-"} Tingkat : ${payment.grade?.level ?? ""}</p>
    <p><strong>Jenis Pembayaran</strong>: ${normalizedPaymentType}</p>
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
        <td>${payment.description ?? explanation}</td>
        <td>Rp ${totalPaid.toLocaleString("id-ID")}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>
      <p>Status: <strong>${statusLabel}</strong></p>
      <p style="font-size: 10px; color: #6b7280; margin-top: 20px;">
        Catatan: Pembayaran yang dilakukan setelah tanggal jatuh tempo
        tetap dianggap sah dan dicatat sesuai semester tagihan.
      </p>

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
