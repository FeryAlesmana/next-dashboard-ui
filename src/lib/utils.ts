import { auth } from "@clerk/nextjs/server";
import prisma from "./prisma";

import crypto from "crypto";

const DAY_INDEX: Record<string, number> = {
  MINGGU: 0,
  SENIN: 1,
  SELASA: 2,
  RABU: 3,
  KAMIS: 4,
  JUMAT: 5,
  SABTU: 6,
};

export function buildUTCDate(date: Date, time?: string) {
  if (!time) {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        0,
        0,
      ),
    );
  }

  const [h, m] = time.split(":").map(Number);

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      h,
      m,
      0,
    ),
  );
}

export function moveDateToDay(baseDate: Date, targetDay: string) {
  // Normalize baseDate to UTC midnight FIRST
  const normalized = new Date(
    Date.UTC(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth(),
      baseDate.getUTCDate(),
    ),
  );

  const currentDay = normalized.getUTCDay() === 0 ? 7 : normalized.getUTCDay();
  const targetDayIndex = DAY_INDEX[targetDay];

  const diff = targetDayIndex - currentDay;

  return new Date(
    Date.UTC(
      normalized.getUTCFullYear(),
      normalized.getUTCMonth(),
      normalized.getUTCDate() + diff,
    ),
  );
}

export function mergeDateAndTime(date: Date, time: Date) {
  const d = new Date(date);
  d.setHours(
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds(),
  );
  return d;
}

export function applyTimeToDateUTC(date: Date, time: string) {
  const [h, m] = time.split(":").map(Number);

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      h,
      m,
      0,
    ),
  );
}

export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const field = (error.meta?.target as string[])?.[0];
      return {
        success: false,
        error: true,
        field,
        message: `${field} sudah digunakan`,
      };
    }
  }
  return null;
}

const PAYMENT_LOG_FIELDS = [
  "studentId",
  "amount",
  "paymentType",
  "status",
  "dueDate",
  "paidAt",
  "description",
  "paymentMethod",
  "receiptNumber",
  "classId",
  "gradeId",
] as const;

type PaymentLogField = (typeof PAYMENT_LOG_FIELDS)[number];
function sanitizeToJson(value: any): any {
  if (value instanceof Date) return value.toISOString();

  if (Prisma.Decimal.isDecimal(value)) return value.toNumber();

  if (Array.isArray(value)) return value.map((v) => sanitizeToJson(v));

  if (value && typeof value === "object") {
    const clean: any = {};
    for (const key of Object.keys(value)) {
      const v = value[key];

      if (v === undefined) continue; // JSON does not allow undefined

      clean[key] = sanitizeToJson(v);
    }
    return clean;
  }

  return value; // string, number, boolean, null
}
export function toPaymentLogUpdateInput(snapshot: any): any {
  if (!snapshot) return {};
  const allowedFields = {
    studentId: true,
    amount: true,
    paymentType: true,
    status: true,
    dueDate: true,
    paidAt: true,
    description: true,
    paymentMethod: true,
    receiptNumber: true,
    classId: true,
    gradeId: true,
  };

  const cleaned: any = {};

  for (const key in snapshot) {
    if (key in allowedFields) {
      cleaned[key as keyof typeof allowedFields] = snapshot[key];
    }
  }

  return cleaned;
}

function sanitizeInstallments(list: any[]) {
  if (!list) return [];

  return list.map((inst) => ({
    id: inst.id ?? null,
    amount: Prisma.Decimal.isDecimal(inst.amount)
      ? inst.amount.toNumber()
      : Number(inst.amount),
    paidAt: inst.paidAt ? new Date(inst.paidAt).toISOString() : null,
  }));
}

export function toIntOrNotFound(value: string) {
  const parsed = parseInt(value);
  if (isNaN(parsed)) return notFound();
  return parsed;
}

export function sanitizePaymentLogSnapshot(snapshot: any) {
  if (!snapshot) return null;

  const base: any = {};

  for (const key of PAYMENT_LOG_FIELDS) {
    if (snapshot[key] !== undefined) {
      base[key] = sanitizeToJson(snapshot[key]);
    }
  }

  let rawInstallments =
    snapshot.paymentInstallments || snapshot.installments || [];

  // ⬅ FIX: Wrap single object into array
  if (!Array.isArray(rawInstallments)) {
    rawInstallments = [rawInstallments];
  }

  base.paymentInstallments = sanitizeInstallments(rawInstallments);

  return base;
}

const PAYMENT_TYPE_MAP: Record<
  string,
  "TUITION" | "EXTRACURRICULAR" | "UNIFORM" | "BOOKS" | "OTHER"
> = {
  // TUITION
  tuition: "TUITION",
  spp: "TUITION",
  sekolah: "TUITION",
  "biaya sekolah": "TUITION",
  "tunggakan spp": "TUITION",

  // EXTRACURRICULAR
  extracurricular: "EXTRACURRICULAR",
  ekstrakurikuler: "EXTRACURRICULAR",
  eskul: "EXTRACURRICULAR",
  kegiatan: "EXTRACURRICULAR",

  // UNIFORM
  uniform: "UNIFORM",
  seragam: "UNIFORM",
  "baju seragam": "UNIFORM",

  // BOOKS
  books: "BOOKS",
  buku: "BOOKS",
  "buku pelajaran": "BOOKS",

  // OTHER
  other: "OTHER",
  lainnya: "OTHER",
  denda: "OTHER",
  "lain-lain": "OTHER",
};

export function mapPaymentType(raw?: string) {
  if (!raw) return null;
  const key = raw.toString().trim().toLowerCase();

  // try exact map
  if (PAYMENT_TYPE_MAP[key]) return PAYMENT_TYPE_MAP[key];

  // try removing spaces/punctuation for more tolerance
  const normalized = key.replace(/[^a-z0-9]/g, "");
  if (PAYMENT_TYPE_MAP[normalized]) return PAYMENT_TYPE_MAP[normalized];

  // fallback tries for short heuristics
  if (normalized.includes("spp") || normalized.includes("tuition"))
    return "TUITION";
  if (
    normalized.includes("ekstra") ||
    normalized.includes("eskul") ||
    normalized.includes("extracurricular")
  )
    return "EXTRACURRICULAR";
  if (normalized.includes("seragam") || normalized.includes("uniform"))
    return "UNIFORM";
  if (normalized.includes("buku")) return "BOOKS";

  // if nothing matched, return null (so you can skip or default)
  return null;
}

export function getPeriodRange(period: "week" | "month" | "year") {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (period === "week") {
    start = new Date(now);
    start.setDate(now.getDate() - 7);
    end = now;
  } else if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = now;
  } else {
    start = new Date(now.getFullYear(), 0, 1);
    end = now;
  }

  return { start, end };
}

export function buildStudentLessonAttendance(attendances: Attendance[]) {
  const statusCounts = {
    HADIR: 0,
    SAKIT: 0,
    ABSEN: 0,
    IZIN: 0,
  };

  attendances.forEach((att) => {
    if (att.status && statusCounts[att.status] !== undefined) {
      statusCounts[att.status]++;
    }
  });

  return [
    { status: "Hadir", count: statusCounts.HADIR },
    { status: "Sakit", count: statusCounts.SAKIT },
    { status: "Absen", count: statusCounts.ABSEN },
    { status: "Izin", count: statusCounts.IZIN },
  ];
}
export const PAYMENT_FIELD_MAP: Record<string, string> = {
  // ===============================
  // REQUIRED: Student Identifier
  // ===============================
  nisn: "nisn",
  "no nisn": "nisn",
  nis: "nisn",
  "no nis": "nisn",
  "id siswa": "nisn",
  siswa: "nisn",
  "kode siswa": "nisn",

  // ===============================
  // REQUIRED: Payment Amount
  // ===============================
  amount: "amount",
  nominal: "amount",
  jumlah: "amount",
  "jumlah bayar": "amount",
  "jumlah pembayaran": "amount",
  "nominal pembayaran": "amount",
  "total bayar": "amount",
  harga: "amount",
  biaya: "amount",
  "biaya spp": "amount",

  // ===============================
  // REQUIRED: Payment Type
  // ===============================
  paymenttype: "paymentType",
  "payment type": "paymentType",
  tipe: "paymentType",
  jenis: "paymentType",
  "jenis pembayaran": "paymentType",
  "tipe pembayaran": "paymentType",
  kategori: "paymentType",
  "kategori pembayaran": "paymentType",

  // ===============================
  // REQUIRED: Due Date
  // ===============================
  duedate: "dueDate",
  "due date": "dueDate",
  "tanggal jatuh tempo": "dueDate",
  "tgl jatuh tempo": "dueDate",
  "jatuh tempo": "dueDate",
  "deadline bayar": "dueDate",

  // ===============================
  // OPTIONAL FIELDS
  // ===============================

  // Description
  description: "description",
  keterangan: "description",
  deskripsi: "description",
  catatan: "description",

  // Payment Method
  paymentmethod: "paymentMethod",
  metode: "paymentMethod",
  "metode pembayaran": "paymentMethod",
  channel: "paymentMethod",
  "cara bayar": "paymentMethod",
  "cara pembayaran": "paymentMethod",
  via: "paymentMethod",

  // Receipt Number
  receipt: "receiptNumber",
  "receipt number": "receiptNumber",
  "no kwitansi": "receiptNumber",
  kwitansi: "receiptNumber",
  "nomor kwitansi": "receiptNumber",

  // Class / Grade (Optional)
  classid: "classId",
  kelas: "classId",
  "id kelas": "classId",

  gradeid: "gradeId",
  tingkat: "gradeId",
  "id tingkat": "gradeId",
};

export function normalizePaymentRow(row: any) {
  const normalized: any = {};

  for (const key in row) {
    if (!key) continue;
    const lowerKey = key.toString().trim().toLowerCase();
    const mappedKey = PAYMENT_FIELD_MAP[lowerKey];
    if (mappedKey) {
      normalized[mappedKey] = row[key];
    }
  }

  return normalized;
}

export const FIELD_MAP: Record<string, string> = {
  // Required
  name: "name",
  nama: "name",
  "nama guru": "name",
  "nama siswa": "name",
  "nama murid": "name",

  phone: "phone",
  telepon: "phone",
  nohp: "phone",
  "nomor telepon": "phone",
  "no. telepon": "phone",
  "nomor hp": "phone",
  "no. hp": "phone",
  nisn: "nisn",

  address: "address",
  alamat: "address",
  "alamat lengkap": "address",

  // Optional
  username: "username",
  password: "password",

  email: "email",
  rw: "rw",
  rt: "rt",
  kelurahan: "kelurahan",
  kecamatan: "kecamatan",
  kota: "kota",
  religion: "religion",
  agama: "religion",
  img: "img",
  sex: "sex",
  jenis_kelamin: "sex",
  gender: "sex",
  "jenis kelamin": "sex",

  birthday: "birthday",
  tanggal_lahir: "birthday",
  "tanggal lahir": "birthday",
  ttl: "birthday",
};

export function normalizeRow(row: any) {
  const normalized: any = {};

  for (const key in row) {
    if (!key) continue;
    const lowerKey = key.toString().trim().toLowerCase();
    const mappedKey = FIELD_MAP[lowerKey];
    if (mappedKey) {
      normalized[mappedKey] = row[key];
    }
  }

  return normalized;
}

export const generateSemesters = (
  createdAt: Date,
  gradeLevel: number,
  role: "admin" | "teacher" | "student" | "parent" | "staff" = "student",
): Semester[] => {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Start from either enrollment year OR calculated grade start year
  const startYear = Math.min(
    createdAt.getFullYear(),
    currentYear - (gradeLevel - 1),
  );

  const graduationYear = startYear + (gradeLevel - 1);
  if (role === "admin") {
    const generated: Semester[] = [];

    for (let year = startYear; year <= currentYear; year++) {
      generated.push({
        label: `Ganjil ${year}/${year + 1}`,
        start: new Date(`${year}-07-01`),
        end: new Date(`${year}-12-31`),
      });
      generated.push({
        label: `Genap ${year}/${year + 1}`,
        start: new Date(`${year + 1}-01-01`),
        end: new Date(`${year + 1}-06-30`),
      });
    }
    return generated.reverse();
  }
  // For non-admin → only until graduation (max 3 years)
  const generated: Semester[] = [];
  const limitStart = Math.max(startYear, currentYear - 2);
  const limitEnd = Math.min(graduationYear, currentYear);

  for (let year = limitStart; year <= limitEnd; year++) {
    generated.push({
      label: `Ganjil ${year}/${year + 1}`,
      start: new Date(`${year}-07-01`),
      end: new Date(`${year}-12-31`),
    });
    generated.push({
      label: `Genap ${year}/${year + 1}`,
      start: new Date(`${year + 1}-01-01`),
      end: new Date(`${year + 1}-06-30`),
    });
  }

  return generated.reverse();
};

// Normalize "agama" field
export function normalizeAgama(
  value: any,
): "Islam" | "Kristen" | "Buddha" | "Lainnya" {
  if (!value) return "Islam"; // default

  const v = String(value).trim().toLowerCase();

  if (["islam", "muslim", "moslem"].includes(v)) return "Islam";
  if (["kristen", "protestan", "katolik", "nasrani"].includes(v))
    return "Kristen";
  if (["buddha", "budha"].includes(v)) return "Buddha";

  return "Lainnya";
}

// Normalize "sex" field
export function normalizeSex(value: any): "MALE" | "FEMALE" {
  if (!value) return "MALE"; // default

  const v = String(value).trim().toLowerCase();

  if (["male", "laki-laki", "laki", "pria", "lelaki"].includes(v))
    return "MALE";
  if (["female", "perempuan", "wanita", "cewe", "cewek"].includes(v))
    return "FEMALE";

  return "MALE"; // fallback
}

import { parse, isValid, format, subDays, addDays } from "date-fns";
import { id as localeID } from "date-fns/locale";
import {
  Attendance,
  PaymentType,
  Prisma,
  resTypes,
  staffrole,
} from "@prisma/client";
import { Semester } from "@/components/client/StudentPaymentView";
import { Decimal } from "@prisma/client/runtime/library";
import { notFound } from "next/navigation";
import { BillLogSchema, PaymentSchema } from "./formValidationSchema";
export function normalizeBirthday(value: any): string {
  if (!value) return "2000-01-01";

  let date: Date | null = null;

  // Case 1: Already a Date
  if (value instanceof Date && !isNaN(value.getTime())) {
    date = value;
  }

  // Case 2: Excel serial number (days since 1900)
  else if (typeof value === "number") {
    date = new Date(1900, 0, value - 1);
  }

  // Case 3: String parsing
  else if (typeof value === "string") {
    const formats = [
      "dd/MM/yyyy",
      "dd-MM-yyyy",
      "dd MMMM yyyy", // full Indonesian month
      "dd MMM yyyy", // abbreviated month
      "yyyy-MM-dd",
    ];
    for (const fmt of formats) {
      const parsed =
        fmt === "dd MMMM yyyy"
          ? parse(value, fmt, new Date(), { locale: localeID })
          : parse(value, fmt, new Date());

      if (isValid(parsed)) {
        date = parsed;
        break;
      }
    }
  }

  // Fallback if still null
  if (!date || !isValid(date)) {
    return "2000-01-01";
  }

  // ✅ Always return YYYY-MM-DD string
  return format(date, "yyyy-MM-dd");
}

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.PASSWORD_SECRET!)
  .digest();
const IV_LENGTH = 16;

// Encrypt password
export function encryptPassword(password: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decrypt password
export function decryptPassword(encrypted: string) {
  const [ivHex, encryptedText] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export const getCurrentUser: any = async () => {
  const { userId, sessionClaims, actor } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  return { userId, role, actor };
};
export const getCurrentStaff = async (id: string) => {
  const staff = await prisma.staff.findUnique({ where: { clerkId: id } });
  const staffrole = staff?.staffroles as staffrole;
  return staffrole;
};

// This runs when loading data for UPDATE form
export const getUpdateFormData = async (resultId: number) => {
  const currentResult = await prisma.result.findUnique({
    where: { id: resultId },
    select: {
      examId: true,
      assignmentId: true,
      studentId: true,
    },
  });

  const [students, exams, assignments, classes] = await prisma.$transaction([
    prisma.student.findMany({
      /* ... your select ... */
    }),
    prisma.exam.findMany({
      where: {
        OR: [
          { results: { none: {} } },
          { id: currentResult?.examId ?? -1 }, // include linked exam
        ],
      },
      select: {
        id: true,
        title: true,
        lesson: { select: { classId: true } },
      },
    }),
    prisma.assignment.findMany({
      where: {
        OR: [
          { results: { none: {} } },
          { id: currentResult?.assignmentId ?? -1 }, // include linked assignment
        ],
      },
      select: {
        id: true,
        title: true,
        lesson: { select: { classId: true } },
      },
    }),
    prisma.class.findMany({
      select: { id: true, name: true, gradeId: true },
    }),
  ]);

  return { students, exams, assignments, classes, currentResult };
};

const SEMESTERS = [
  {
    label: "Ganjil 2024/2025",
    start: new Date("2024-07-01"),
    end: new Date("2024-12-31"),
  },
  {
    label: "Genap 2024/2025",
    start: new Date("2025-01-01"),
    end: new Date("2025-06-30"),
  },
  {
    label: "Ganjil 2023/2024",
    start: new Date("2023-07-01"),
    end: new Date("2023-12-31"),
  },
  {
    label: "Genap 2023/2024",
    start: new Date("2024-01-01"),
    end: new Date("2024-06-30"),
  },
  // ... add more past semesters
];

export const getProfileByClerkIdAndRole = async (
  clerkId: string,
  role?: string,
) => {
  const defaultImg = "/avatar.png";

  switch (role) {
    case "student":
      const student = await prisma.student.findUnique({
        where: { clerkId: clerkId },
        select: { name: true, img: true, class: { select: { name: true } } },
      });
      return {
        name: student?.name ?? "Siswa",
        img: student?.img ?? defaultImg,
        staffRole: undefined,
        class: student?.class?.name
      };

    case "teacher":
      const teacher = await prisma.teacher.findUnique({
        where: { clerkId: clerkId },
        select: { name: true, img: true },
      });
      return {
        name: teacher?.name ?? "Guru",
        img: teacher?.img ?? defaultImg,
        staffRole: undefined,
        class: undefined
      };

    case "staff":
      const staff = await prisma.staff.findUnique({
        where: { clerkId: clerkId },
        select: { name: true, img: true, staffroles: true },
      });
      return {
        name: staff?.name ?? "Staff",
        img: staff?.img ?? defaultImg,
        staffRole: staff?.staffroles ?? "",
        class: undefined
      };

    case "parent":
      const parent = await prisma.parent.findUnique({
        where: { clerkId: clerkId },
        select: { name: true },
      });
      return {
        name: parent?.name ?? "Wali Murid",
        img: defaultImg,
        staffRole: undefined,
        class: undefined
      };

    default:
      return {
        name: "Admin",
        img: defaultImg,
        staffRole: undefined,
        class: undefined
      };
  }
};

// Admin: Fetch new PPDB entries within last 7 days
export async function getAdminNotifications() {
  const oneWeekAgo = subDays(new Date(), 7);

  const ppdbItems = await prisma.pPDB.findMany({
    where: { createdAt: { gte: oneWeekAgo } },
    select: { id: true, name: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return ppdbItems.map((item) => ({
    id: item.id,
    type: "ppdb",
    message: `Pendaftar baru: ${item.name}`,
    createdAt: item.createdAt,
  }));
}
export async function getParentNotifications(parentId: string) {
  const now = new Date();
  const upcoming = addDays(now, 3);
  const since = addDays(now, -7);

  // 1. Announcements
  const announcements = await prisma.announcement.findMany({
    where: {
      class: { students: { some: { parentId } } },
      date: { gte: since },
    },
    select: { id: true, title: true, description: true, date: true },
    orderBy: { date: "desc" },
  });

  const announcementNotifications = announcements.map((a) => ({
    id: `announcement-${a.id}`,
    type: "announcement",
    message: `Pengumuman: ${a.title} - ${a.description.substring(0, 50)}...`,
    createdAt: a.date,
  }));

  // 2. Events
  const events = await prisma.event.findMany({
    where: { startTime: { gte: now, lte: upcoming } },
    select: { id: true, description: true, startTime: true },
    orderBy: { startTime: "asc" },
  });

  const eventNotifications = events.map((e) => ({
    id: `event-${e.id}`,
    type: "event",
    message: `Acara "${
      e.description
    }" akan berlangsung pada ${e.startTime.toLocaleDateString("id-ID")}`,
    createdAt: e.startTime,
  }));

  // 3. New Results (last 7 days)
  const results = await prisma.result.findMany({
    where: {
      student: {
        OR: [
          { parentId }, // main parent
          { secondParentId: parentId },
          { guardianId: parentId },
        ],
      },
      createdAt: { gte: since },
    },
    select: {
      id: true,
      score: true,
      resultType: true,
      createdAt: true,
      student: { select: { name: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const resultTypelabel: Record<resTypes, string> = {
    UJIAN_HARIAN: "Ujian Harian",
    UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
    UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
    PEKERJAAN_RUMAH: "Pekerjaan Rumah",
    TUGAS_AKHIR: "Tugas Akhir",
    TUGAS_HARIAN: "Tugas Harian",
  };

  const resultNotifications = results.map((r) => {
    const readableLabel =
      resultTypelabel[r.resultType as resTypes] ?? r.resultType;

    return {
      id: `result-${r.id}`,
      studentId: r.student?.id,
      type: "result",
      message: `Nilai baru untuk ${r.student?.name}: ${readableLabel} = ${r.score}`,
      createdAt: r.createdAt,
    };
  });

  // 4. New Attendance (last 7 days)
  const attendances = await prisma.attendance.findMany({
    where: {
      student: {
        OR: [
          { parentId },
          { secondParentId: parentId },
          { guardianId: parentId },
        ],
      },
      date: { gte: since },
    },
    select: {
      id: true,
      date: true,
      status: true,
      student: { select: { name: true, id: true } },
      meeting: {
        select: {
          meetingNo: true,
          lesson: {
            select: { id: true, name: true, class: { select: { name: true } } },
          },
          id: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  const attendanceNotifications = attendances.map((a) => ({
    id: `attendance-${a.id}`,
    type: "attendance",
    message: `Absensi ${a.student?.name} pada ${a.meeting?.lesson.name} (pertemuan-${a.meeting?.meetingNo}): ${a.status}`,
    createdAt: a.date,
    className: a.meeting?.lesson.class?.name,
    studentId: a.student?.id,
    meetingId: a.meeting?.id,
    lessonId: a.meeting?.lesson.id,
  }));

  // Merge all
  const notifications = [
    ...announcementNotifications,
    ...eventNotifications,
    ...resultNotifications,
    ...attendanceNotifications,
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return notifications;
}

export async function getTeacherNotifications(teacherId: string) {
  const now = new Date();
  const upcoming = addDays(now, 3);
  const announcements = await prisma.announcement.findMany({
    where: {
      class: { students: { some: { id: teacherId } } },
      date: { gte: addDays(now, -7) }, // last 7 days
    },
    select: { id: true, title: true, description: true, date: true },
    orderBy: { date: "desc" },
  });

  const announcementNotifications = announcements.map((a) => ({
    id: `announcement-${a.id}`,
    type: "announcement",
    message: `Pengumuman: ${a.title} - ${a.description.substring(0, 50)}...`,
    createdAt: a.date,
  }));

  // Events
  const events = await prisma.event.findMany({
    where: {
      startTime: { gte: now, lte: upcoming },
    },
    select: { id: true, description: true, startTime: true },
    orderBy: { startTime: "asc" },
  });

  const eventNotifications = events.map((e) => ({
    id: `event-${e.id}`,
    type: "event",
    message: `Acara "${
      e.description
    }" akan berlangsung pada ${e.startTime.toLocaleDateString("id-ID")}`,
    createdAt: e.startTime,
  }));
  const notifications = [
    ...announcementNotifications,
    ...eventNotifications,
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return notifications;
}
// Student: Assignments near due date (next 3 days)
export async function getStudentNotifications(studentId: string) {
  const now = new Date();
  const upcoming = addDays(now, 3);

  // Assignments
  const assignments = await prisma.assignment.findMany({
    where: {
      lesson: { class: { students: { some: { id: studentId } } } },
      dueDate: { gte: now, lte: upcoming },
    },
    select: { id: true, title: true, dueDate: true },
    orderBy: { dueDate: "asc" },
  });

  const assignmentNotifications = assignments.map((a) => ({
    id: `assignment-${a.id}`,
    type: "assignment",
    message: `Tugas "${
      a.title
    }" mendekati Deadline (${a.dueDate.toLocaleDateString("id-ID")})`,
    createdAt: a.dueDate,
  }));

  // Announcements
  const announcements = await prisma.announcement.findMany({
    where: {
      class: { students: { some: { id: studentId } } },
      date: { gte: addDays(now, -7) }, // last 7 days
    },
    select: { id: true, title: true, description: true, date: true },
    orderBy: { date: "desc" },
  });

  const announcementNotifications = announcements.map((a) => ({
    id: `announcement-${a.id}`,
    type: "announcement",
    message: `Pengumuman: ${a.title} - ${a.description.substring(0, 50)}...`,
    createdAt: a.date,
  }));

  // Events
  const events = await prisma.event.findMany({
    where: {
      startTime: { gte: now, lte: upcoming },
    },
    select: { id: true, description: true, startTime: true },
    orderBy: { startTime: "asc" },
  });

  const eventNotifications = events.map((e) => ({
    id: `event-${e.id}`,
    type: "event",
    message: `Acara "${
      e.description
    }" akan berlangsung pada ${e.startTime.toLocaleDateString("id-ID")}`,
    createdAt: e.startTime,
  }));

  // Merge all notifications and sort by createdAt
  const notifications = [
    ...assignmentNotifications,
    ...announcementNotifications,
    ...eventNotifications,
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return notifications;
}

const currentWorkWeek = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const startOfWeek = new Date(today);

  if (dayOfWeek === 0) {
    startOfWeek.setDate(today.getDate() + 1);
  }
  if (dayOfWeek === 6) {
    startOfWeek.setDate(today.getDate() + 2);
  } else {
    startOfWeek.setDate(today.getDate() - (dayOfWeek - 1));
  }
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
};

export const adjustScheduleToCurentWeek = (
  lessons: { title: string; start: Date; end: Date }[],
): { title: string; start: Date; end: Date }[] => {
  const startOfWeek = currentWorkWeek();

  return lessons.map((lesson) => {
    const lessonDayOfWeek = lesson.start.getDay();

    const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;
    const adjustedStartDate = new Date(startOfWeek);

    adjustedStartDate.setDate(startOfWeek.getDate() + daysFromMonday);
    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedStartDate.setHours(
      lesson.start.getHours(),
      lesson.start.getMinutes(),
      lesson.start.getSeconds(),
    );
    adjustedEndDate.setHours(
      lesson.end.getHours(),
      lesson.end.getMinutes(),
      lesson.end.getSeconds(),
    );

    return {
      title: lesson.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};

export const generateRecurringLessons = (
  lessons: { title: string; start: Date; end: Date }[],
  numberOfWeeks: number = 6,
): { title: string; start: Date; end: Date }[] => {
  const today = new Date();
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Senin minggu ini
  currentWeekMonday.setHours(0, 0, 0, 0);

  const result: { title: string; start: Date; end: Date }[] = [];

  for (const lesson of lessons) {
    const lessonDay = lesson.start.getDay(); // 0 (Sunday) to 6 (Saturday)
    const timeStart = {
      hours: lesson.start.getHours(),
      minutes: lesson.start.getMinutes(),
    };
    const timeEnd = {
      hours: lesson.end.getHours(),
      minutes: lesson.end.getMinutes(),
    };

    for (let i = 0; i < numberOfWeeks; i++) {
      const baseDate = new Date(currentWeekMonday);
      baseDate.setDate(currentWeekMonday.getDate() + lessonDay + i * 7);

      const start = new Date(baseDate);
      start.setHours(timeStart.hours, timeStart.minutes);

      const end = new Date(baseDate);
      end.setHours(timeEnd.hours, timeEnd.minutes);

      result.push({
        title: lesson.title,
        start,
        end,
      });
    }
  }

  return result;
};
export default function extractCloudinaryPublicId(url: string): string | null {
  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const publicIdWithExtension = url.substring(uploadIndex + 8); // remove "/upload/"
    const publicId = publicIdWithExtension.split(".")[0]; // remove .jpg / .webp / .png etc.

    return publicId;
  } catch {
    return null;
  }
}

export async function normalizeSearchParams(
  searchParams:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | undefined,
): Promise<{ [key: string]: string | undefined }> {
  const resolved = await searchParams;
  const normalized: { [key: string]: string | undefined } = {};
  Object.entries(resolved ?? {}).forEach(([key, value]) => {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  });
  return normalized;
}

export const calculateSubjectScore = (
  results: any,
  lessonId: number,
  resultTypes: string[],
) => {
  // Determine the source of lessonId based on the result type
  const filteredResults = results.filter((r: any) => {
    let resultLessonId = null;
    if (r.exam && r.exam.lessonId) resultLessonId = r.exam.lessonId;
    if (r.assignment && r.assignment.lessonId)
      resultLessonId = r.assignment.lessonId;

    const isCorrectType = resultTypes.includes(r.resultType);

    return resultLessonId === lessonId && isCorrectType;
  });

  if (filteredResults.length === 0) return 0;

  // Calculate the average score for the filtered results and round it
  const totalScore = filteredResults.reduce(
    (sum: number, r: any) => sum + r.score,
    0,
  );
  return Math.round(totalScore / filteredResults.length);
};
