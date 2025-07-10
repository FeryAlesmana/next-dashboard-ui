"use server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

import { revalidatePath } from "next/cache";
import {
  AnnouncementSchema,
  AssignmentSchema,
  ClassSchema,
  classSchema,
  EventSchema,
  ExamSchema,
  LessonSchema,
  ParentSchema,
  PpdbSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  subjectSchema,
  TeacherSchema,
  teacherSchema,
} from "./formValidationSchema";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import extractCloudinaryPublicId, { getCurrentUser } from "./utils";
import { error } from "console";

export type CurrentState = {
  success: boolean;
  error: boolean;
  message?: string;
};
const client = await clerkClient();

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};
export const deleteSubject = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
): Promise<CurrentState> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.class.create({
      data: data,
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data: data,
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};
export const deleteClass = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};
export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        religion: data.religion,
        img: data.img || null,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: number) => ({
            id: subjectId,
          })),
        },
        lessons: {
          connect: data.lessons?.map((lessonId: number) => ({
            id: lessonId,
          })),
        },
        classes: {
          connect: data.classes?.map((classId: number) => ({
            id: classId,
          })),
        },
      },
    });
    return { success: true, error: false };
  } catch (error: any) {
    let message = "Unknown error";
    // Handle Clerk API errors properly

    if (
      error?.errors &&
      Array.isArray(error.errors) &&
      error.errors.length > 0
    ) {
      message = error.errors[0].message;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    return { success: false, error: true, message };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    if (!data.id) {
      console.log(data.id + "Data.id");

      return { success: false, error: true, message: "Missing teacher ID" };
    }
    let userId = data.id;
    try {
      const user = await client.users.updateUser(data.id, {
        username: data.username,
        ...(data.password !== "" && { password: data.password }),
        firstName: data.name,
        lastName: data.surname,
      });
      userId = user.id;
    } catch (error) {
      console.warn(
        "⚠️ Clerk returned no user info. User may already be deleted?"
      );
      console.error();
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        id: userId,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        ...(data.img && { img: data.img }),
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: number) => ({
            id: subjectId,
          })),
        },
        lessons: {
          set: data.lessons?.map((lessonId: number) => ({
            id: lessonId,
          })),
        },
        classes: {
          set: data.classes?.map((classId: number) => ({
            id: classId,
          })),
        },
      },
    });
    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("updateTeacher error:", error);
    return { success: false, error: true, message };
  }
};
export const deleteTeacher = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  try {
    if (!id) {
      console.log(id);
      return { success: false, error: true, message: "Missing teacher ID" };
    }
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (teacher?.img) {
      const publicId = extractCloudinaryPublicId(teacher.img);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary image deleted:", publicId);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });
    try {
      const deletedUser = await client.users.deleteUser(id);

      if (deletedUser) {
        console.log("✅ User Sucessfully deleted:", deletedUser.id);
      }
    } catch (error) {
      console.warn(
        "⚠️ Clerk returned no user info. User may already be deleted?"
      );
    }

    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("Delete Teacher error: ", error);
    return { success: false, error: true, message };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  const classItem = await prisma.class.findUnique({
    where: { id: data.classId },
    include: {
      _count: {
        select: {
          students: true,
        },
      },
    },
  });

  if (classItem && classItem.capacity === classItem._count.students) {
    return { success: false, error: true };
  }
  try {
    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        religion: data.religion,
        img: data.img || null,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    await prisma.student_details.create({
      data: {
        student: {
          connect: { id: user?.id || data.id },
        },
        asalSekolah: data.asalSekolah,
        birthPlace: data.birthPlace,
        nisn: data.nisn,
        npsn: data.npsn,
        no_ijz: data.no_ijz,
        nik: data.nik,
        kps: data.kps || null,
        no_kps: data.no_kps || null,
        height: data.height,
        weight: data.weight,
        transportation: data.transportation,
        tempat_tinggal: data.tempat_tinggal,
        distance_from_home: data.distance_from_home,
        time_from_home: data.time_from_home,
        number_of_siblings: data.number_of_siblings,
        postcode: data.postcode,
        awards: data.awards || null,
        awards_date: data.awards_date || null,
        scholarship: data.scholarship || null,
        scholarship_detail: data.scholarship_detail || null,
        dokumenIjazah: data.dokumenIjazah || null,
        dokumenAkte: data.dokumenAkte || null,
        dokumenPasfoto: data.dokumenPasfoto || null,
        dokumenKKKTP: data.dokumenKKKTP || null,
      },
    });
    return { success: true, error: false };
  } catch (error: any) {
    let message = "Unknown error";
    // Handle Clerk API errors properly

    if (
      error?.errors &&
      Array.isArray(error.errors) &&
      error.errors.length > 0
    ) {
      message = error.errors[0].message;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    return { success: false, error: true, message };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    if (!data.id) {
      console.log(data.id + "Data.id");

      return { success: false, error: true, message: "Missing student ID" };
    }

    let user;
    try {
      user = await client.users.updateUser(data.id, {
        username: data.username,
        ...(data.password !== "" && { password: data.password }),
        firstName: data.name,
        lastName: data.surname,
      });
      if (user) {
        console.log("✅ User Sucessfully Updated:", user.id);
      }
      return { success: true, error: false };
    } catch (error) {
      console.warn("⚠️ Clerk returned no user info. User maybe didnt exist?");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        id: user?.id || data.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        ...(data.img && { img: data.img }),
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    await prisma.student_details.update({
      where: {
        id: parseInt(data.sdId),
      },
      data: {
        student: {
          connect: { id: user?.id || data.id },
        },
        asalSekolah: data.asalSekolah,
        birthPlace: data.birthPlace,
        nisn: data.nisn,
        npsn: data.npsn,
        no_ijz: data.no_ijz,
        nik: data.nik,
        kps: data.kps || null,
        no_kps: data.no_kps || null,
        height: data.height,
        weight: data.weight,
        transportation: data.transportation,
        tempat_tinggal: data.tempat_tinggal,
        distance_from_home: data.distance_from_home,
        time_from_home: data.time_from_home,
        number_of_siblings: data.number_of_siblings,
        postcode: data.postcode,
        awards: data.awards || null,
        awards_date: data.awards_date || null,
        scholarship: data.scholarship || null,
        scholarship_detail: data.scholarship_detail || null,
        dokumenIjazah: data.dokumenIjazah || null,
        dokumenAkte: data.dokumenAkte || null,
        dokumenPasfoto: data.dokumenPasfoto || null,
        dokumenKKKTP: data.dokumenKKKTP || null,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("updateStudent error:", error);
    return { success: false, error: true, message };
  }
};
export const deleteStudent = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  try {
    if (!id) {
      console.log(id);
      return { success: false, error: true, message: "Missing Student ID" };
    }
    const student = await prisma.student.findUnique({ where: { id } });
    if (student?.img) {
      const publicId = extractCloudinaryPublicId(student.img);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary image deleted:", publicId);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    try {
      const deletedUser = await client.users.deleteUser(id);

      if (deletedUser) {
        console.log("✅ User Sucessfully deleted:", deletedUser.id);
      }
    } catch (error) {
      console.warn(
        "⚠️ Clerk returned no user info. User may already be deleted?"
      );
    }

    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("Delete Student error: ", error);
    return { success: false, error: true, message };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    const { userId, role } = await getCurrentUser();
    if (role == "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
          id: data.lessonId,
        },
      });
      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Create Ujian error: ", error);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    const { userId, role } = await getCurrentUser();
    if (role == "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
          id: data.lessonId,
        },
      });
      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }
    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("update Ujian error: ", error);
    return { success: false, error: true, message };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  try {
    const { userId, role } = await getCurrentUser();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Create Event error: ", error);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("update Ujian error: ", error);
    return { success: false, error: true, message };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};
export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    const classIdRaw = data.classId; // comes from the form
    const classId = classIdRaw === undefined ? null : data.classId;
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(),
        classId: classId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Create Event error: ", error);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(),
        classId: data.classId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("update Ujian error: ", error);
    return { success: false, error: true, message };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    const { userId, role } = await getCurrentUser();
    if (role == "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
          id: data.lessonId,
        },
      });
      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: new Date(),
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Create Ujian error: ", error);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    const { userId, role } = await getCurrentUser();
    if (role == "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
          id: data.lessonId,
        },
      });
      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }
    await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startDate: new Date(),
        dueDate: new Date(data.dueDate),
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("update Ujian error: ", error);
    return { success: false, error: true, message };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  try {
    const { userId, role } = await getCurrentUser();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
        ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent" },
    });
    if (user) {
      console.log("✅ User Sucessfully created:", user.id);
    } else {
      console.warn(
        "⚠️ Clerk returned no user info. User may already be created?"
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email,
        birthday: data.birthday,
        job: data.job,
        income: data.income,
        degree: data.degree,
        phone: data.phone,
        address: data.address,
        students: {
          connect: data.students.map((studentId) => ({ id: studentId })),
        },
      },
    });
    return { success: true, error: false };
  } catch (error: any) {
    console.log(error + " Di server action");

    let message = "Unknown error";
    // Handle Clerk API errors properly

    if (
      error?.errors &&
      Array.isArray(error.errors) &&
      error.errors.length > 0
    ) {
      message = error.errors[0].message;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    return { success: false, error: true, message };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    if (!data.id) {
      console.log(data.id + "Data.id");

      return { success: false, error: true, message: "Missing Parent ID" };
    }

    const user = await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        students: {
          set: data.students.map((studentId) => ({ id: studentId })),
        },
      },
    });
    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("updateParent error:", error);
    return { success: false, error: true, message };
  }
};
export const deleteParent = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  try {
    if (!id) {
      console.log(id);
      return { success: false, error: true, message: "Missing Parent ID" };
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.student.updateMany({
      where: { parentId: id },
      data: { parentId: "-" },
    });
    await prisma.parent.delete({
      where: {
        id: id,
      },
    });

    try {
      const deletedUser = await client.users.deleteUser(id);

      if (deletedUser) {
        console.log("✅ User Sucessfully deleted:", deletedUser.id);
      }
    } catch (error) {
      console.warn(
        "⚠️ Clerk returned no user info. User may already be deleted?"
      );
    }

    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("Delete Parent error: ", error);
    return { success: false, error: true, message };
  }
};

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        startTime: data.startTime,
        day: data.day,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Create Jadwal error: ", error);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        startTime: data.startTime,
        day: data.day,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("update Ujian error: ", error);
    return { success: false, error: true, message };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  try {
    const { userId, role } = await getCurrentUser();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.lesson.delete({
      where: {
        id: parseInt(id),
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        ...(data.selectedType === "Ujian" && {
          examId: data.examId,
          assignmentId: null,
        }),
        ...(data.selectedType === "Tugas" && {
          assignmentId: data.assignmentId,
          examId: null,
        }),
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Create Jadwal error: ", error);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.update({
      where: {
        id: data.id,
      },
      data: {
        score: data.score,
        studentId: data.studentId,
        ...(data.selectedType === "Ujian" && {
          examId: data.examId,
          assignmentId: null,
        }),
        ...(data.selectedType === "Tugas" && {
          assignmentId: data.assignmentId,
          examId: null,
        }),
      },
    });
    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("update Ujian error: ", error);
    return { success: false, error: true, message };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  try {
    const { userId, role } = await getCurrentUser();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};

export const createPpdb = async (
  currentState: CurrentState,
  data: PpdbSchema
) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.pPDB.create({
      data: {
        id: data.id ? data.id : undefined,
        name: data.name,
        surname: data.name,
        email: data.email,
        phone: data.phone,
        address:
          data.address +
          " " +
          data.rw +
          " " +
          data.rt +
          " " +
          data.kelurahan +
          " " +
          data.kecamatan +
          " " +
          data.kota,
        religion: data.religion,
        sex: data.sex,
        birthday: data.birthday,
        asalSekolah: data.asalSekolah,
        birthPlace: data.birthPlace,
        nisn: data.nisn,
        npsn: data.npsn,
        no_ijz: data.no_ijz,
        nik: data.nik,
        kps: data.kps || null,
        no_kps: data.no_kps || null,
        height: data.height,
        weight: data.weight,
        transportation: data.transportation,
        tempat_tinggal: data.tempat_tinggal,
        distance_from_home: data.distance_from_home,
        time_from_home: data.time_from_home,
        number_of_siblings: data.number_of_siblings,
        namaAyah: data.namaAyah,
        tahunLahirAyah: data.tahunLahirAyah,
        pekerjaanAyah: data.pekerjaanAyah,
        pendidikanAyah: data.pendidikanAyah,
        penghasilanAyah: data.penghasilanAyah,
        telpAyah: data.telpAyah,
        namaIbu: data.namaIbu,
        tahunLahirIbu: data.tahunLahirIbu,
        pekerjaanIbu: data.pekerjaanIbu,
        pendidikanIbu: data.pendidikanIbu,
        penghasilanIbu: data.penghasilanIbu,
        telpIbu: data.telpIbu,
        namaWali: data.namaWali,
        tahunLahirWali: data.tahunLahirWali,
        pekerjaanWali: data.pekerjaanWali,
        pendidikanWali: data.pendidikanWali,
        penghasilanWali: data.penghasilanWali,
        telpWali: data.telpWali,
        postcode: data.postcode,
        awards: data.awards || null,
        awards_date: data.awards_date ? new Date(data.awards_date) : null,
        scholarship: data.scholarship || null,
        scholarship_detail: data.scholarship_detail || null,
        dokumenIjazah: data.dokumenIjazah || null,
        dokumenAkte: data.dokumenAkte || null,
        dokumenPasfoto: data.dokumenPasfoto || null,
        dokumenKKKTP: data.dokumenKKKTP || null,
        isvalid: false,
      },
    });

    return { success: true, error: false };
  } catch (error: any) {
    let message = "Unknown error";

    if (
      error?.errors &&
      Array.isArray(error.errors) &&
      error.errors.length > 0
    ) {
      message = error.errors[0].message;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    return { success: false, error: true, message };
  }
};

export const updatePpdb = async (
  currentState: CurrentState,
  data: PpdbSchema
) => {
  try {
    if (!data.id) {
      console.log(data.id + "Data.id");

      return { success: false, error: true, message: "Missing student ID" };
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.pPDB.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        surname: data.name,
        email: data.email,
        phone: data.phone,
        address:
          data.address +
          " " +
          data.rw +
          " " +
          data.rt +
          " " +
          data.kelurahan +
          " " +
          data.kecamatan +
          " " +
          data.kota,
        religion: data.religion,
        sex: data.sex,
        birthday: data.birthday,
        asalSekolah: data.asalSekolah,
        birthPlace: data.birthPlace,
        nisn: data.nisn,
        npsn: data.npsn,
        no_ijz: data.no_ijz,
        nik: data.nik,
        kps: data.kps || null,
        no_kps: data.no_kps || null,
        height: data.height,
        weight: data.weight,
        transportation: data.transportation,
        tempat_tinggal: data.tempat_tinggal,
        distance_from_home: data.distance_from_home,
        time_from_home: data.time_from_home,
        number_of_siblings: data.number_of_siblings,
        namaAyah: data.namaAyah,
        tahunLahirAyah: data.tahunLahirAyah,
        pekerjaanAyah: data.pekerjaanAyah,
        pendidikanAyah: data.pendidikanAyah,
        penghasilanAyah: data.penghasilanAyah,
        telpAyah: data.telpAyah,
        namaIbu: data.namaIbu,
        tahunLahirIbu: data.tahunLahirIbu,
        pekerjaanIbu: data.pekerjaanIbu,
        pendidikanIbu: data.pendidikanIbu,
        penghasilanIbu: data.penghasilanIbu,
        telpIbu: data.telpIbu,
        namaWali: data.namaWali,
        tahunLahirWali: data.tahunLahirWali,
        pekerjaanWali: data.pekerjaanWali,
        pendidikanWali: data.pendidikanWali,
        penghasilanWali: data.penghasilanWali,
        telpWali: data.telpWali,
        postcode: data.postcode,
        awards: data.awards || null,
        awards_date: data.awards_date ? new Date(data.awards_date) : null,
        scholarship: data.scholarship || null,
        scholarship_detail: data.scholarship_detail || null,
        ...(data.dokumenIjazah !== "" && { dokumenIjazah: data.dokumenIjazah }),
        ...(data.dokumenAkte !== "" && { dokumenAkte: data.dokumenAkte }),
        ...(data.dokumenKKKTP !== "" && { dokumenKKKTP: data.dokumenKKKTP }),
        isvalid: false,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("updatePpdb error:", error);
    return { success: false, error: true, message };
  }
};
export const deletePpdb = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  try {
    if (!id) {
      console.log(id);
      return { success: false, error: true, message: "Missing Ppdb ID" };
    }
    const student = await prisma.student.findUnique({ where: { id } });
    if (student?.img) {
      const publicId = extractCloudinaryPublicId(student.img);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary image deleted:", publicId);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    try {
      const deletedUser = await client.users.deleteUser(id);

      if (deletedUser) {
        console.log("✅ User Sucessfully deleted:", deletedUser.id);
      }
    } catch (error) {
      console.warn(
        "⚠️ Clerk returned no user info. User may already be deleted?"
      );
    }

    return { success: true, error: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("Delete Ppdb error: ", error);
    return { success: false, error: true, message };
  }
};
