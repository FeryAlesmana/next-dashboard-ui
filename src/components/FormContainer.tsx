import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { getCurrentUser } from "@/lib/utils";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "ppdb";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  role?: string;
};
const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  const { userId, role } = await getCurrentUser();
  let relatedData = {};

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "parent":
        const parentStudents = await prisma.student.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });
        relatedData = { students: parentStudents };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: {
            id: true,
            level: true,
          },
        });
        const classTeacher = await prisma.teacher.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });
        relatedData = { teachers: classTeacher, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: {
            id: true,
            name: true,
          },
        });
        const teacherClasses = await prisma.class.findMany({
          select: {
            id: true,
            name: true,
          },
        });
        const teacherLessons = await prisma.lesson.findMany({
          select: {
            id: true,
            name: true,
            day: true,
          },
        });

        relatedData = {
          subjects: teacherSubjects,
          classes: teacherClasses,
          lessons: teacherLessons,
        };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: {
            id: true,
            level: true,
          },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        const studentParents = await prisma.parent.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });

        relatedData = {
          grades: studentGrades,
          classes: studentClasses,
          parents: studentParents,
        };
        break;
      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: userId! } : {}),
          },
          select: {
            id: true,
            name: true,
          },
        });

        relatedData = { lessons: examLessons };
        break;
      case "event":
        let classIds: number[] = [];

        if (role === "teacher") {
          const teacher = await prisma.teacher.findUnique({
            where: { id: userId! },
            select: {
              classes: { select: { id: true } },
            },
          });

          const supervised = teacher?.classes.map((c) => c.id) || [];
          classIds = [...new Set([...supervised])];
        }

        const relatedClasses = await prisma.class.findMany({
          where: {
            ...(classIds.length > 0 ? { id: { in: classIds } } : {}),
          },
          select: {
            id: true,
            name: true,
          },
        });
        console.log(relatedClasses + " Kelas Event");

        relatedData = { classes: relatedClasses };
        break;
      case "announcement":
        let idClass: number[] = [];

        if (role === "teacher") {
          const teacher = await prisma.teacher.findUnique({
            where: { id: userId! },
            select: {
              classes: { select: { id: true } },
            },
          });

          const supervised = teacher?.classes.map((c) => c.id) || [];
          idClass = [...new Set([...supervised])];
        }

        const ClassAnnouncement = await prisma.class.findMany({
          where: {
            ...(idClass.length > 0 ? { id: { in: idClass } } : {}),
          },
          select: {
            id: true,
            name: true,
          },
        });

        relatedData = { kelas2: ClassAnnouncement };

        break;
      case "assignment":
        const assignLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: userId! } : {}),
          },
          select: {
            id: true,
            name: true,
          },
        });
        let kelasId: number[] = [];

        if (role === "teacher") {
          const teacher = await prisma.teacher.findUnique({
            where: { id: userId! },
            select: {
              classes: { select: { id: true } },
            },
          });

          const supervised = teacher?.classes.map((c) => c.id) || [];
          kelasId = [...new Set([...supervised])];
        }

        const ClassAssignment = await prisma.class.findMany({
          where: {
            ...(kelasId.length > 0 ? { id: { in: kelasId } } : {}),
          },
          select: {
            id: true,
            name: true,
          },
        });

        relatedData = { lessons: assignLessons, kelas2: ClassAssignment };
        break;
      case "lesson":
        const lessonSubjects = await prisma.subject.findMany({
          select: {
            id: true,
            name: true,
          },
        });
        const lessonClasses = await prisma.class.findMany({
          select: {
            id: true,
            name: true,
          },
        });
        const Lessonteachers = await prisma.teacher.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });

        relatedData = {
          subjects: lessonSubjects,
          classes: lessonClasses,
          teachers: Lessonteachers,
        };
        break;
      case "result":
        const studentResult = await prisma.student.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });
        const studentExam = await prisma.exam.findMany({
          select: {
            id: true,
            title: true,
          },
        });
        const studentAssignment = await prisma.assignment.findMany({
          select: {
            id: true,
            title: true,
          },
        });

        relatedData = {
          students: studentResult,
          exams: studentExam,
          assignments: studentAssignment,
        };
        break;
      case "ppdb":
        break;

      default:
        break;
    }
  }
  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
        role={role}
      ></FormModal>
    </div>
  );
};

export default FormContainer;
