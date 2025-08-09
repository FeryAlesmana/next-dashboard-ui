import { auth } from "@clerk/nextjs/server";
import prisma from "./prisma";

import crypto from "crypto";

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

export const getCurrentUser = async () => {
  const { userId, sessionClaims, actor } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  return { userId, role, actor };
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
  role?: string
) => {
  const defaultImg = "/avatar.png";

  switch (role) {
    case "student":
      return (
        (await prisma.student.findUnique({
          where: { id: clerkId },
          select: { name: true, img: true },
        })) ?? { name: "Siswa", img: defaultImg }
      );

    case "teacher":
      return (
        (await prisma.teacher.findUnique({
          where: { id: clerkId },
          select: { name: true, img: true },
        })) ?? { name: "Guru", img: defaultImg }
      );

    case "parent":
      const parent = await prisma.parent.findUnique({
        where: { id: clerkId },
        select: { name: true },
      });
      return {
        name: parent?.name ?? "Orang Tua",
        img: defaultImg,
      };

    default:
      return { name: "Admin", img: defaultImg };
  }
};

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
  lessons: { title: string; start: Date; end: Date }[]
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
      lesson.start.getSeconds()
    );
    adjustedEndDate.setHours(
      lesson.end.getHours(),
      lesson.end.getMinutes(),
      lesson.end.getSeconds()
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
  numberOfWeeks: number = 6
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
    | undefined
): Promise<{ [key: string]: string | undefined }> {
  const resolved = await searchParams;
  const normalized: { [key: string]: string | undefined } = {};
  Object.entries(resolved ?? {}).forEach(([key, value]) => {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  });
  return normalized;
}
