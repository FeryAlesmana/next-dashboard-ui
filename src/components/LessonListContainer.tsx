// app/list/lessons/LessonListContainer.tsx
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { Day, Prisma } from "@prisma/client";
import Table from "./Table";
import Pagination from "./Pagination";

interface LessonListContainerProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  columns: {
    header: string;
    accessor: string;
    className?: string;
  }[];
  renderRow: (item: any) => React.ReactNode;
}

export default async function LessonListContainer({
  searchParams,
  columns,
  renderRow,
}: LessonListContainerProps) {
  const sp = normalizeSearchParams(searchParams);
  const { page, ...queryParams } = await sp;
  const p = page ? parseInt(page) : 1;

  const { role, userId } = await getCurrentUser();
  const query: Prisma.LessonWhereInput = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined)
        switch (key) {
          case "teacherId":
            query.teacherId = value.trim();
            console.log("teacherId param:", value);

            break;
          case "classId":
            query.classId = parseInt(value);
            break;
          case "gradeId":
            query.class = {
              is: {
                gradeId: parseInt(value),
              },
            };
            break;

          case "day":
            if (Object.values(Day).includes(value as Day)) {
              query.day = value as Day;
            }
            break;
          case "search":
            query.OR = [
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
              { class: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
    }
  }

  // ROLE CONDITION

  const hasTeacherIdParam = query.teacherId !== undefined;
  switch (role) {
    case "admin":
      break;
    case "teacher": {
      if (!hasTeacherIdParam) {
        const teacher = await prisma.teacher.findUnique({
          where: { id: userId! },
          include: { classes: { select: { id: true, name: true } } },
        });

        // Fetch supervised classes directly
        const supervisedClasses = teacher?.classes || [];
        const supervisedClassesWithLessons = await Promise.all(
          supervisedClasses.map(async (cls) => {
            const lessons = await prisma.lesson.findMany({
              where: { classId: cls.id },
              include: {
                subject: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            });
            return { ...cls, lessons };
          })
        );
        // Fetch teaching lessons separately
        const [teachingLessons, lessonCount] = await prisma.$transaction([
          prisma.lesson.findMany({
            where: { teacherId: userId! },
            include: {
              subject: { select: { name: true } },
              class: { select: { name: true, gradeId: true } },
              teacher: { select: { name: true, surname: true } },
            },
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
          }),
          prisma.lesson.count({ where: { teacherId: userId! } }),
        ]);
      }
    }
  }
  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true, gradeId: true } },
        teacher: { select: { name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: query }),
  ]);

  return (
    <div className="">
      <Table columns={columns} renderRow={renderRow} data={data}></Table>
      <Pagination page={p} count={count}></Pagination>
    </div>
  );
}
