import { auth } from "@clerk/nextjs/server";

export const getCurrentUser = async () => {
  const { userId, sessionClaims, actor } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  return { userId, role, actor };
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
