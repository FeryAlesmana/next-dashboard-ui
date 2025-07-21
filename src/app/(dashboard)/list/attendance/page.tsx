import Link from "next/link";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import prisma from "@/lib/prisma";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import { Lesson, Subject, Class, Teacher } from "@prisma/client";
import Image from "next/image";

const ITEM_PER_PAGE = 10;

type LessonWithRelations = Lesson & {
  subject: Subject | null;
  class: Class | null;
  teacher?: { name: string } | null;
};

export default async function AttendancePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId, role } = await getCurrentUser();

  const sp = normalizeSearchParams(searchParams);
  const { page, search } = await sp;
  const p = page ? parseInt(page) : 1;

  const query: any = {}; // Prisma.LessonWhereInput (simplified for clarity)

  let lessons: LessonWithRelations[] = [];
  let students: any[] = [];
  let className = "";

  switch (role) {
    case "student": {
      const student = await prisma.student.findUnique({
        where: { id: userId! },
        select: { classId: true, class: { select: { name: true } } },
      });

      if (!student?.classId) {
        return (
          <div className="p-8 text-center text-gray-500">
            Anda belum terdaftar di kelas manapun.
          </div>
        );
      }

      className = student.class?.name ?? "";
      query.classId = student.classId;
      break;
    }

    case "teacher": {
      query.teacherId = userId!;
      break;
    }

    case "parent": {
      const children = await prisma.student.findMany({
        where: {
          OR: [
            { parentId: userId! },
            { secondParentId: userId! },
            { guardianId: userId! },
          ],
        },
        select: { classId: true, name: true, id: true },
      });

      const classIds = children
        .map((child) => child.classId)
        .filter((id): id is number => id !== null && id !== undefined);

      if (classIds.length === 0) {
        return (
          <div className="p-8 text-center text-gray-500">
            Tidak ada data kelas anak Anda.
          </div>
        );
      }

      query.classId = { in: classIds };

      const studentsWithLessons = await Promise.all(
        children.map(async (child) => {
          const lessons = child.classId
            ? await prisma.lesson.findMany({
                where: { classId: child.classId },
                include: { subject: true, class: true },
              })
            : [];

          return { id: child.id, name: child.name, lessons };
        })
      );

      students = studentsWithLessons;
      break;
    }

    case "admin": {
      if (search) {
        query.OR = [
          { subject: { name: { contains: search, mode: "insensitive" } } },
          { class: { name: { contains: search, mode: "insensitive" } } },
          { teacher: { name: { contains: search, mode: "insensitive" } } },
        ];
      }
      break;
    }

    default: {
      return <div className="p-8 text-center text-red-500">Akses ditolak.</div>;
    }
  }

  if (role === "parent") {
    // Parent uses preloaded student lessons
  } else {
    const [result, count] = await prisma.$transaction([
      prisma.lesson.findMany({
        where: query,
        include: {
          subject: true,
          class: true,
          teacher: { select: { name: true } },
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.lesson.count({ where: query }),
    ]);

    lessons = result;

    if (lessons.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          Belum ada jadwal ditemukan.
        </div>
      );
    }

    return (
      <div className="w-full mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Daftar Jadwal Presensi</h1>
          {role === "admin" && <TableSearch />}
        </div>

        <div className="grid gap-6">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/list/attendance/${lesson.class?.name}/${lesson.id}`}
              className="block p-4 rounded-lg border hover:shadow-md transition bg-white"
            >
              <div className="font-semibold text-lg mb-1">
                {lesson.subject?.name} ({lesson.class?.name})
              </div>
              {role === "admin" && (
                <div className="text-sm text-gray-500 mb-1">
                  Guru: {lesson.teacher?.name ?? "Belum ditentukan"}
                </div>
              )}
              <div className="text-sm text-gray-500">
                ID Jadwal: {lesson.id}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Pagination page={p} count={count} />
        </div>
      </div>
    );
  }

  // Parent View
  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Daftar Jadwal Presensi</h1>

      {students.map((student) => (
        <div key={student.id} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{student.name}</h2>
          <div className="grid gap-4">
            {student.lessons.length > 0 ? (
              student.lessons.map((lesson: LessonWithRelations) => (
                <Link
                  key={lesson.id}
                  href={`/list/attendance/${lesson.class?.name}/${lesson.id}`}
                  className="block p-4 rounded-lg border hover:shadow-md transition bg-white"
                >
                  <div className="font-semibold text-lg mb-1">
                    {lesson.subject?.name}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    Kelas: {lesson.class?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID Jadwal: {lesson.id}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-400">
                Tidak ada jadwal tersedia.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
