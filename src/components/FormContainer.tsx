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
    | "ppdb"
    | "paymentLog";
  type: "create" | "update" | "delete" | "deleteMany" | "updateMany";
  data?: any;
  id?: number | string;
  ids?: string[] | number[]; // For bulk delete
  lessonId?: string; // For attendance form
  prefilEmail?: string;
  onDeleted?: (ids: (string | number)[]) => void;
  onChanged?: (item: any) => void;
};
const FormContainer = async ({
  table,
  type,
  data,
  id,
  lessonId,
  prefilEmail,
}: FormContainerProps) => {
  const { userId, role } = await getCurrentUser();
  let relatedData = {};
  // console.log(data, " data in form container");
  // console.log(id, " id in form container");

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: {
            id: true,
            name: true,
            namalengkap: true,
          },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "parent":
        const parentStudents = await prisma.student.findMany({
          select: {
            id: true,
            name: true,
            namalengkap: true,
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
            namalengkap: true,
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
            namalengkap: true,
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
            subject: { select: { name: true } },
            class: { select: { name: true } },
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
            subject: { select: { name: true } },
            class: { select: { name: true } },
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
            namalengkap: true,
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
            namalengkap: true,
            classId: true,
          },
        });
        const studentExam = await prisma.exam.findMany({
          where: {
            results: {
              none: {},
            },
          },
          select: {
            id: true,
            title: true,
            lesson: { select: { classId: true } },
          },
        });
        const studentAssignment = await prisma.assignment.findMany({
          where: {
            results: {
              none: {},
            },
          },
          select: {
            id: true,
            title: true,
            lesson: { select: { classId: true } },
          },
        });

        relatedData = {
          students: studentResult,
          exams: studentExam,
          assignments: studentAssignment,
        };
        break;
      case "ppdb":
        const newStudentGrades = await prisma.grade.findMany({
          select: {
            id: true,
            level: true,
          },
        });
        const newStudentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        const newStudentParents = await prisma.parent.findMany({
          select: {
            id: true,
            name: true,
            namalengkap: true,
          },
        });

        relatedData = {
          grades: newStudentGrades,
          classes: newStudentClasses,
          parents: newStudentParents,
        };
        break;
      case "attendance":
        const attendanceLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: userId! } : {}),
          },
          select: {
            id: true,
            name: true,
            day: true,
            startTime: true,
            endTime: true,
          },
        });
        // Only fetch students in the class of the meeting/lesson
        let classId = data?.classId;
        // If not present, try to get from lessonId
        if (!classId && data?.lessonId) {
          const lesson = await prisma.lesson.findUnique({
            where: { id: Number(data.lessonId) },
            select: { classId: true },
          });
          classId = lesson?.classId;
        }
        const classStudents = classId
          ? await prisma.student.findMany({
              where: { classId },
              select: {
                id: true,
                name: true,
                namalengkap: true,
                class: {
                  select: {
                    name: true,
                  },
                },
              },
            })
          : [];

        relatedData = {
          lessons: attendanceLessons,
          students: classStudents,
        };
        break;
      case "paymentLog":
        const studentData = await prisma.student.findMany({
          select: {
            id: true,
            name: true,
            namalengkap: true,
          },
        });
        const classData = await prisma.class.findMany({
          select: {
            id: true,
            name: true,
          },
        });
        const gradeData = await prisma.grade.findMany({
          select: {
            id: true,
            level: true,
          },
        });

        relatedData = {
          studentData: studentData,
          classData: classData,
          gradeData: gradeData,
        };
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
        lessonId={lessonId}
        relatedData={relatedData}
        prefilEmail={prefilEmail}
      ></FormModal>
    </div>
  );
};

export default FormContainer;
