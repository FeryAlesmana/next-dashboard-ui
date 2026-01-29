import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";
import fetch from "node-fetch";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs";

async function fetchAsBytes(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return await res.arrayBuffer();
}

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

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function drawHeader(
  pdf: PDFDocument,
  page: PDFPage,
  font: PDFFont,
  boldFont: PDFFont,
) {
  const logoPath = path.join(process.cwd(), "public/logo.png");
  let y = 800;

  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    const logo = await pdf.embedPng(logoBytes);
    page.drawImage(logo, { x: 50, y: y - 40, width: 60, height: 60 });
  }

  page.drawText("SMP ISLAMIYAH SERUA", {
    x: 120,
    y,
    size: 14,
    font: boldFont,
  });

  y -= 18;
  page.drawText(
    "Jl. Serua Raya No.23 • Telp: 0821-1240-9732 • Kode Pos 45561",
    { x: 120, y, size: 9, font },
  );

  y -= 15;
  page.drawText("email: smpsmkserua@gmail.com", {
    x: 120,
    y,
    size: 9,
    font,
  });

  page.drawLine({
    start: { x: 50, y: y - 15 },
    end: { x: 545, y: y - 15 },
    thickness: 1,
  });
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const idAsNumber = parseInt(id);
  const ppdb = await prisma.pPDB.findUnique({
    where: { id: idAsNumber },
  });

  if (!ppdb || !ppdb.isvalid) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const MARGIN_X = 60;
  const MARGIN_TOP = 780;
  const MARGIN_BOTTOM = 60;
  const LINE_HEIGHT = 14;

  const LABEL_X = MARGIN_X;
  const COLON_X = 230;
  const VALUE_X = 240;

  const FONT_SIZE = 9;
  const SECTION_FONT_SIZE = 11;

  function createPage(pdf: PDFDocument) {
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    return page;
  }

  function ensureSpace(
    pdf: PDFDocument,
    currentPage: PDFPage,
    y: number,
    needed = LINE_HEIGHT,
    font?: PDFFont,
    boldFont?: PDFFont,
  ) {
    if (y - needed < MARGIN_BOTTOM) {
      const newPage = createPage(pdf);
      if (font && boldFont) {
        drawHeader(pdf, newPage, font, boldFont);
      }
      return { page: newPage, y: MARGIN_TOP - 80 };
    }
    return { page: currentPage, y };
  }

  function drawSectionTitle(
    page: PDFPage,
    title: string,
    y: number,
    boldFont: PDFFont,
  ) {
    page.drawLine({
      start: { x: MARGIN_X, y: y + 10 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: y + 10 },
      thickness: 0.7,
    });

    page.drawText(title, {
      x: MARGIN_X,
      y,
      size: SECTION_FONT_SIZE,
      font: boldFont,
    });

    return y - 22;
  }

  function drawRow(
    page: PDFPage,
    label: string,
    value: any,
    y: number,
    font: PDFFont,
    boldFont: PDFFont,
  ) {
    const text =
      value !== null && value !== undefined && value !== ""
        ? String(value)
        : "-";

    page.drawText(label, {
      x: LABEL_X,
      y,
      size: FONT_SIZE,
      font: boldFont,
    });

    page.drawText(":", {
      x: COLON_X,
      y,
      size: FONT_SIZE,
      font,
    });

    page.drawText(text, {
      x: VALUE_X,
      y,
      size: FONT_SIZE,
      font,
      maxWidth: PAGE_WIDTH - VALUE_X - MARGIN_X,
      lineHeight: LINE_HEIGHT,
    });

    return y - LINE_HEIGHT;
  }

  const sections = [
    {
      title: "IDENTITAS PESERTA DIDIK",
      fields: [
        ["Nama Lengkap", ppdb.name],
        ["Tempat Lahir", ppdb.birthPlace],
        ["Tanggal Lahir", ppdb.birthday.toLocaleDateString("id-ID")],
        ["Jenis Kelamin", translateEnum(ppdb.sex, "sex")],
        ["Agama", ppdb.religion],
        ["NISN", ppdb.nisn],
        ["NIK", ppdb.nik],
        ["Asal Sekolah", ppdb.asalSekolah],
        ["NPSN", ppdb.npsn],
        ["Nomor Ijazah", ppdb.no_ijz],
      ],
    },
    {
      title: "ALAMAT & KONTAK",
      fields: [
        ["Alamat", ppdb.address],
        ["RT / RW", `${ppdb.rt} / ${ppdb.rw}`],
        ["Kelurahan", ppdb.kelurahan],
        ["Kecamatan", ppdb.kecamatan],
        ["Kota", ppdb.kota],
        ["Kode Pos", ppdb.postcode],
        ["No. HP", ppdb.phone],
        ["No. WhatsApp", ppdb.noWa],
        ["Email", ppdb.email],
      ],
    },
    {
      title: "DATA ORANG TUA",
      fields: [
        ["Nama Ayah", ppdb.namaAyah],
        ["Pekerjaan Ayah", ppdb.pekerjaanAyah],
        ["Pendidikan Ayah", translateEnum(ppdb.pendidikanAyah, "degree")],
        [
          "Penghasilan Ayah",
          ppdb.penghasilanAyah
            ? `Rp ${ppdb.penghasilanAyah.toLocaleString("id-ID")}`
            : null,
        ],
        ["Nama Ibu", ppdb.namaIbu],
        ["Pekerjaan Ibu", ppdb.pekerjaanIbu],
        ["Pendidikan Ibu", translateEnum(ppdb.pendidikanIbu, "degree")],
      ],
    },
    {
      title: "PRESTASI & BEASISWA",
      fields: [
        ["Prestasi", ppdb.awards],
        ["Tingkat", translateEnum(ppdb.awards_lvl, "awards")],
        ["Tahun", ppdb.awards_date?.getFullYear()],
        ["Beasiswa", ppdb.scholarship],
        ["Detail Beasiswa", ppdb.scholarship_detail],
      ],
    },
  ];

  /* ============================
     1. COVER PAGE
  ============================ */
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  const cover = pdf.addPage([595, 842]);
  await drawHeader(pdf, cover, font, boldFont);

  let cy = 650;

  cover.drawText("BERKAS PENERIMAAN PESERTA DIDIK BARU", {
    x: 120,
    y: cy,
    size: 16,
    font: boldFont,
  });
  cy -= 40;

  const info = [
    ["Nama Calon Siswa", ppdb.name],
    ["NISN", ppdb.nisn],
    ["Asal Sekolah", ppdb.asalSekolah],
    ["Tanggal Pendaftaran", ppdb.createdAt.toLocaleDateString("id-ID")],
  ];

  info.forEach(([label, value]) => {
    cover.drawText(label, { x: 120, y: cy, size: 11, font: boldFont });
    cover.drawText(":", { x: 280, y: cy, size: 11, font });
    cover.drawText(String(value ?? "-"), {
      x: 290,
      y: cy,
      size: 11,
      font,
    });
    cy -= 20;
  });

  let page = createPage(pdf);
  await drawHeader(pdf, page, font, boldFont);
  let y = MARGIN_TOP - 80;

  for (const section of sections) {
    ({ page, y } = ensureSpace(pdf, page, y, 40, font, boldFont));
    y = drawSectionTitle(page, section.title, y, boldFont);

    for (const [label, value] of section.fields) {
      ({ page, y } = ensureSpace(
        pdf,
        page,
        y,
        LINE_HEIGHT * 2,
        font,
        boldFont,
      ));
      y = drawRow(page, label as string, value, y, font, boldFont);
    }

    y -= 12;
  }

  /* ============================
     2. MERGE DOCUMENTS
  ============================ */
  const dokumen = [
    ppdb.dokumenIjazah,
    ppdb.dokumenAkte,
    ppdb.dokumenPasfoto,
    ppdb.dokumenKKKTP,
  ].filter(Boolean);

  console.log(dokumen, "dokumen in download berkas");

  if (dokumen.length === 0) {
    return NextResponse.json({ error: "Dokumen kosong." }, { status: 400 });
  }

  for (const url of dokumen) {
    if (url) {
      const bytes = await fetchAsBytes(url);

      if (url.endsWith(".pdf")) {
        const extPdf = await PDFDocument.load(bytes);
        const pages = await pdf.copyPages(extPdf, extPdf.getPageIndices());
        pages.forEach((p) => pdf.addPage(p));
      } else {
        // IMAGE → PDF page
        const img = url.endsWith(".png")
          ? await pdf.embedPng(bytes)
          : await pdf.embedJpg(bytes);

        const imgPage = pdf.addPage();
        const { width, height } = img.scale(1);

        imgPage.drawImage(img, {
          x: 50,
          y: 50,
          width: Math.min(width, 500),
          height: Math.min(height, 700),
        });
      }
    }
  }

  page.drawLine({
    start: { x: MARGIN_X, y: 60 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: 60 },
  });

  page.drawText("Dokumen ini dihasilkan secara otomatis oleh Sistem PPDB.", {
    x: MARGIN_X,
    y: 45,
    size: 8,
    font,
  });

  /* ============================
     3. RETURN FILE
  ============================ */
  const finalPdf = await pdf.save();

  return new NextResponse(Buffer.from(finalPdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ppdb-${ppdb.nisn}-${ppdb.name
        .replace(/\s+/g, "_")
        .toLowerCase()}.pdf"`,
    },
  });
}
