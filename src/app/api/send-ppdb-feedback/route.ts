import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma"; // adjust path to your prisma instance
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

function translateEnum(enumValue: any, type: string): string {
  if (!enumValue) return "-";
  switch (type) {
    case "sex":
      return enumValue === "MALE" ? "Laki-Laki" : "Perempuan";
    case "kps":
      if (enumValue === "KIP") return "KIP";
      if (enumValue === "KIS") return "KIS";
      if (enumValue === "KKS") return "KKS";
      return "-";
    case "tinggal":
      switch (enumValue) {
        case "Orang_Tua":
          return "Orang Tua";
        case "Wali":
          return "Wali";
        case "Kost":
          return "Kost";
        case "Asrama":
          return "Asrama";
        case "Panti_asuhan":
          return "Panti Asuhan";
        case "Pesantren":
          return "Pesantren";
        default:
          return "-";
      }
    case "awards":
      switch (enumValue) {
        case "kecamatan":
          return "Kecamatan";
        case "kota":
          return "Kota";
        case "kabupaten":
          return "Kabupaten";
        case "provinsi":
          return "Provinsi";
        case "nasional":
          return "Nasional";
        case "internasional":
          return "Internasional";
        default:
          return "-";
      }
    case "degree":
      switch (enumValue) {
        case "TIDAK_ADA":
          return "Tidak Ada";
        case "SD":
          return "SD";
        case "SMP":
          return "SMP";
        case "SMA":
          return "SMA";
        case "D3":
          return "Diploma 3";
        case "S1":
          return "Sarjana (S1)";
        case "S2":
          return "Magister (S2)";
        case "S3":
          return "Doktor (S3)";
        default:
          return "-";
      }
    default:
      return enumValue;
  }
}

async function generateFormulirPDF(ppdb: any) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();
  let y = height - 50;

  // === Header ===
  const logoPath = path.join(process.cwd(), "public/logo.png"); // put your logo file in /public
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    page.drawImage(logoImage, { x: 50, y: y - 40, width: 60, height: 60 });
  }

  page.drawText("SMP ISLAMIYAH SERUA", {
    x: 130,
    y,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });
  y -= 20;
  page.drawText(
    "Jl. Serua Raya No.23, Telp: +6282112409732, Fax: +6282112409732, Kode Pos: 45561",
    { x: 130, y, size: 9, font }
  );
  y -= 15;
  page.drawText("Email: smpiserua@sch.id • Website: sman9kuningan.sch.id", {
    x: 130,
    y,
    size: 9,
    font,
  });

  // Line
  y -= 20;
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1 });

  const currentYear = new Date().getFullYear();
  // Title
  y -= 30;
  page.drawText(`Formulir Penerimaan Peserta Didik Baru Tahun ${currentYear}`, {
    x: 120,
    y,
    size: 12,
    font: boldFont,
  });

  // === Layout constants ===
  const xLabel = 60; // left margin for labels
  const xValue = 180; // fixed column for values (aligned neatly)
  const lineHeight = 14; // vertical spacing
  const fontSize = 9; // smaller font for cleaner fit

  // === Helpers ===
  function drawSection(title: string, noline: boolean = false) {
    // Draw line only if noline is false
    if (!noline) {
      page.drawLine({
        start: { x: 50, y: y + 10 }, // little above the title
        end: { x: page.getWidth() - 50, y: y + 10 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
    }
    y -= 20;
    page.drawText(title, { x: xLabel, y, size: 11, font: boldFont });
    y -= 10;
  }

  let firstColumnX: number | null = null; // store first column colonX globally

  function drawRow(label: string, value: any) {
    const text = value != null ? String(value) : "-";

    // Use firstColumnX if set, otherwise center it
    const colonX = firstColumnX ?? page.getWidth() / 2;
    const labelWidth = boldFont.widthOfTextAtSize(label, fontSize);

    page.drawText(label, {
      x: colonX - labelWidth - 2,
      y,
      size: fontSize,
      font: boldFont,
    });

    page.drawText(":", { x: colonX, y, size: fontSize, font });

    page.drawText(text, {
      x: colonX + 5,
      y,
      size: fontSize,
      font,
    });

    y -= lineHeight;
  }

  function drawRowGroup(fields: { label: string; value: any }[]) {
    const sectionWidth = page.getWidth() / fields.length;

    fields.forEach((f, i) => {
      const text = f.value != null ? String(f.value) : "-";
      const labelWidth = boldFont.widthOfTextAtSize(f.label, fontSize);

      const colonX = sectionWidth * i + sectionWidth / 2;

      if (i === 0) firstColumnX = colonX;
      page.drawText(f.label, {
        x: colonX - labelWidth - 2,
        y,
        size: fontSize,
        font: boldFont,
      });

      page.drawText(":", { x: colonX, y, size: fontSize, font });

      page.drawText(text, {
        x: colonX + 5,
        y,
        size: fontSize,
        font,
      });
    });

    y -= lineHeight;
  }

  // === Identitas Peserta Didik ===
  drawSection("IDENTITAS PESERTA DIDIK", true);
  // drawRow("Nama Calon Siswa", ppdb.name);
  // drawRow(
  //   "Tempat, Tanggal Lahir",
  //   `${ppdb.birthPlace}, ${ppdb.birthday.toLocaleDateString("id-ID")}`
  // );
  drawRowGroup([
    { label: "Nama Calon Siswa", value: ppdb.name },
    {
      label: "Tempat, Tanggal Lahir",
      value: `${ppdb.birthPlace}, ${ppdb.birthday.toLocaleDateString("id-ID")}`,
    },
  ]);
  drawRowGroup([
    { label: "Jenis Kelamin", value: translateEnum(ppdb.sex, "sex") },
    { label: "Agama", value: ppdb.religion },
  ]);
  drawRow("Asal Sekolah", ppdb.asalSekolah);
  drawRowGroup([
    { label: "NPSN", value: ppdb.npsn },
    { label: "NISN", value: ppdb.nisn },
  ]);
  drawRow("Nomor Seri Ijazah", ppdb.no_ijz);
  drawRow("NIK", ppdb.nik);
  drawRow("Alamat", ppdb.address);
  drawRowGroup([
    { label: "RT", value: ppdb.rt },
    { label: "RW", value: ppdb.rw },
    { label: "Kelurahan", value: ppdb.kelurahan },
  ]);
  drawRowGroup([
    { label: "Kecamatan", value: ppdb.kecamatan },
    { label: "Kota", value: ppdb.kota },
    { label: "Kode Pos", value: ppdb.postcode },
  ]);
  drawRowGroup([
    { label: "No. Telepon", value: ppdb.phone },
    { label: "No. HP/WA", value: ppdb.noWa },
  ]);
  drawRowGroup([
    { label: "Alat Transportasi", value: ppdb.transportation },
    {
      label: "Tempat Tinggal",
      value: translateEnum(ppdb.tempat_tinggal, "tinggal"),
    },
  ]);
  drawRowGroup([
    { label: "Penerima KPS", value: translateEnum(ppdb.kps, "kps") },
    { label: "No. KPS/KIP/KIS", value: ppdb.no_kps },
  ]);
  drawRow("Email Pribadi", ppdb.email);
  drawRowGroup([
    { label: "Tinggi Badan", value: `${ppdb.height} cm` },
    { label: "Berat Badan", value: `${ppdb.weight} kg` },
  ]);
  drawRowGroup([
    { label: "Jarak ke Sekolah", value: `${ppdb.distance_from_home} km` },
    { label: "Waktu Tempuh", value: `${ppdb.time_from_home} menit` },
  ]);
  drawRow("Jumlah Saudara Kandung", ppdb.number_of_siblings);

  // === Data Ayah ===
  drawSection("DATA AYAH KANDUNG");
  drawRow("Nama Ayah", ppdb.namaAyah);
  drawRowGroup([
    { label: "Tahun Lahir", value: ppdb.tahunLahirAyah?.getFullYear() },
    { label: "Pekerjaan", value: ppdb.pekerjaanAyah },
  ]);
  drawRowGroup([
    {
      label: "Pendidikan",
      value: translateEnum(ppdb.pendidikanAyah, "degree"),
    },
    {
      label: "Penghasilan",
      value:
        ppdb.penghasilanAyah != null
          ? `Rp ${ppdb.penghasilanAyah.toLocaleString("id-ID")}`
          : "-",
    },
  ]);
  drawRow("No. Telepon", ppdb.telpAyah);

  // === Data Ibu ===
  drawSection("DATA IBU KANDUNG");
  drawRow("Nama Ibu", ppdb.namaIbu);
  drawRowGroup([
    { label: "Tahun Lahir", value: ppdb.tahunLahirIbu?.getFullYear() },
    { label: "Pekerjaan", value: ppdb.pekerjaanIbu },
  ]);
  drawRowGroup([
    { label: "Pendidikan", value: translateEnum(ppdb.pendidikanIbu, "degree") },
    {
      label: "Penghasilan",
      value:
        ppdb.penghasilanIbu != null
          ? `Rp ${ppdb.penghasilanIbu.toLocaleString("id-ID")}`
          : "-",
    },
  ]);
  drawRow("No. Telepon", ppdb.telpIbu);

  // === Data Wali ===
  drawSection("DATA WALI");
  drawRow("Nama Wali", ppdb.namaWali);
  drawRowGroup([
    { label: "Tahun Lahir", value: ppdb.tahunLahirWali?.getFullYear() },
    { label: "Pekerjaan", value: ppdb.pekerjaanWali },
  ]);
  drawRowGroup([
    {
      label: "Pendidikan",
      value: translateEnum(ppdb.pendidikanWali, "degree"),
    },
    {
      label: "Penghasilan",
      value:
        ppdb.penghasilanWali != null
          ? `Rp ${ppdb.penghasilanWali.toLocaleString("id-ID")}`
          : "-",
    },
  ]);
  drawRow("No. Telepon", ppdb.telpWali);

  // === Prestasi ===
  drawSection("PRESTASI & BEASISWA");
  drawRow("Jenis Prestasi", ppdb.awards);
  drawRowGroup([
    { label: "Tingkat", value: translateEnum(ppdb.awards_lvl, "awards") },
    { label: "Tahun", value: ppdb.awards_date?.getFullYear() },
  ]);
  drawRow("Beasiswa", ppdb.scholarship);
  drawRowGroup([
    { label: "Detail", value: ppdb.scholarship_detail },
    { label: "Tahun", value: ppdb.scholarship_date?.getFullYear() },
  ]);

  // === Footer ===
  const printedDate = ppdb.createdAt.toLocaleString("id-ID");
  page.drawLine({
    start: { x: 50, y: 60 },
    end: { x: 545, y: 60 },
    thickness: 1,
  });
  page.drawText(
    "Simpanlah lembar pendaftaran ini sebagai bukti pendaftaran Anda.",
    { x: 50, y: 45, size: 9, font }
  );
  page.drawText(`Dicetak pada ${printedDate}`, {
    x: 350,
    y: 45,
    size: 9,
    font,
  });

  return await pdfDoc.save();
}

export async function POST(req: Request) {
  const { id, message, isValid } = await req.json();
  console.log(id, message, isValid, "json in api");

  if (!id || !message) {
    return NextResponse.json(
      { error: "ID dan pesan wajib diisi." },
      { status: 400 }
    );
  }

  // Cari data PPDB dari DB
  const ppdb = await prisma.pPDB.findUnique({ where: { id:id } });
  if (!ppdb) {
    return NextResponse.json(
      { error: "Data PPDB tidak ditemukan." },
      { status: 404 }
    );
  }

  // Generate PDF
  let pdfBytes: Uint8Array<ArrayBufferLike> | undefined;
  if (isValid) {
    pdfBytes = await generateFormulirPDF(ppdb);
  }
  // Nodemailer setup
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
          <img src="https://res.cloudinary.com/dbfascepc/image/upload/v1753534026/favicon_iqgit7.png" 
               alt="Logo Sekolah" height="60" style="display:block; margin: 0 auto;" />
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
    const mailOptions: any = {
      from: `"PPDB Sekolah" <${process.env.SMTP_USER}>`,
      to: ppdb.email,
      subject: "Notifikasi Formulir PPDB",
      html: htmlContent,
    };

    // Tambahkan attachment hanya jika isValid === true
    if (isValid && pdfBytes) {
      mailOptions.attachments = [
        {
          filename: `formulir-ppdb-${ppdb.id}.pdf`,
          content: Buffer.from(pdfBytes),
          contentType: "application/pdf",
        },
      ];
    }

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json(
      { error: "Gagal mengirim email." },
      { status: 500 }
    );
  }
}
