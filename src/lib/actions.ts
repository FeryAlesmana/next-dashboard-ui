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
  AttendanceSchema,
  ClassSchema,
  EventSchema,
  ExamSchema,
  LessonSchema,
  ParentSchema,
  PaymentLogSchema,
  PpdbSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  teacherSchema,
} from "./formValidationSchema";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import extractCloudinaryPublicId, { getCurrentUser } from "./utils";
import { Degree, Prisma } from "@prisma/client";

export type CurrentState = {
  success: boolean;
  error: boolean;
  message?: string;
  id?: string;
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
        rw: data.rw,
        rt: data.rt,
        kelurahan: data.kelurahan,
        kecamatan: data.kecamatan,
        kota: data.kota,
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
    let user;
    try {
      const user = await client.users.updateUser(data.id, {
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
      console.warn(
        "⚠️ Clerk returned no user info. Attempting to create user..."
      );
      // Create new Clerk user if update fails
      user = await client.users.createUser({
        username: data.username,
        password: data.password !== "" ? data.password : undefined,
        firstName: data.name,
        lastName: data.surname,
        publicMetadata: { role: "teacher" },
      });

      if (user) {
        console.log("✅ New User Created:", user.id);
      } else {
        console.error("❌ Failed to create Clerk user.");
        return {
          success: false,
          error: true,
          message: "Failed to create user in Clerk",
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        // ...(data.password !== "" && { password: data.password }),
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
        rw: data.rw,
        rt: data.rt,
        kelurahan: data.kelurahan,
        kecamatan: data.kecamatan,
        kota: data.kota,
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
        noWa: data.noWa,
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
    return { success: true, error: false, id: user.id };
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
    let clerkUserId = data.id;
    try {
      user = await client.users.updateUser(data.id, {
        username: data.username,
        ...(data.password !== "" && { password: data.password }),
        firstName: data.name,
        lastName: data.surname,
      });
      if (user) {
        console.log("✅ User Sucessfully Updated:", user.id);
        clerkUserId = user.id;
      }
    } catch (error) {
      console.warn(
        "⚠️ Clerk returned no user info. Attempting to create user..."
      );
      // Create new Clerk user if update fails
      user = await client.users.createUser({
        username: data.username,
        password: data.password !== "" ? data.password : undefined,
        firstName: data.name,
        lastName: data.surname,
        publicMetadata: { role: "student" },
      });

      if (user) {
        console.log("✅ New User Created:", user.id);
        clerkUserId = user.id;
      } else {
        console.error("❌ Failed to create Clerk user.");
        return {
          success: false,
          error: true,
          message: "Failed to create user in Clerk",
          id: clerkUserId,
        };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        id: clerkUserId,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        rw: data.rw,
        rt: data.rt,
        kelurahan: data.kelurahan,
        kecamatan: data.kecamatan,
        kota: data.kota,
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
        noWa: data.noWa,
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
    let retries = 0;
    const maxRetries = 10;
    const delay = 300; // ms

    while (retries < maxRetries) {
      const student = await prisma.student.findUnique({
        where: { id: user?.id || data.id },
      });

      if (student) break;

      await new Promise((resolve) => setTimeout(resolve, delay));
      retries++;
    }

    return { success: true, error: false, id: clerkUserId };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("updateStudent error:", error);
    return { success: false, error: true, message, id: data.id };
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
        sex: data.sex,
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

      return { success: false, error: true, message: "Missing teacher ID" };
    }
    let user;
    try {
      const user = await client.users.updateUser(data.id, {
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
      console.warn(
        "⚠️ Clerk returned no user info. Attempting to create user..."
      );
      // Create new Clerk user if update fails
      user = await client.users.createUser({
        username: data.username,
        password: data.password !== "" ? data.password : undefined,
        firstName: data.name,
        lastName: data.surname,
        publicMetadata: { role: "parent" },
      });

      if (user) {
        console.log("✅ New User Created:", user.id);
      } else {
        console.error("❌ Failed to create Clerk user.");
        return {
          success: false,
          error: true,
          message: "Failed to create user in Clerk",
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        // ...(data.password !== "" && { password: data.password }),
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
        address: data.address,
        rw: data.rw,
        rt: data.rt,
        kelurahan: data.kelurahan,
        kecamatan: data.kecamatan,
        kota: data.kota,
        religion: data.religion,
        sex: data.sex,
        birthday: new Date(data.birthday),
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
        namaAyah: data.namaAyah === "" ? null : data.namaAyah,
        tahunLahirAyah:
          data.tahunLahirAyah && data.tahunLahirAyah !== ""
            ? new Date(data.tahunLahirAyah)
            : null,
        pekerjaanAyah: data.pekerjaanAyah === "" ? null : data.pekerjaanAyah,
        pendidikanAyah: data.pendidikanAyah === "" ? null : data.pendidikanAyah,
        penghasilanAyah:
          data.penghasilanAyah === "" ? null : data.penghasilanAyah ?? null,
        telpAyah: data.telpAyah === "" ? null : data.telpAyah,
        namaIbu: data.namaIbu === "" ? null : data.namaIbu,
        tahunLahirIbu:
          data.tahunLahirIbu && data.tahunLahirIbu !== ""
            ? new Date(data.tahunLahirIbu)
            : null,
        pekerjaanIbu: data.pekerjaanIbu === "" ? null : data.pekerjaanIbu,
        pendidikanIbu: data.pendidikanIbu === "" ? null : data.pendidikanIbu,
        penghasilanIbu:
          data.penghasilanIbu === "" ? null : data.penghasilanIbu ?? null,
        telpIbu: data.telpIbu === "" ? null : data.telpIbu,
        namaWali: data.namaWali === "" ? null : data.namaWali,
        tahunLahirWali:
          data.tahunLahirWali && data.tahunLahirWali !== ""
            ? new Date(data.tahunLahirWali)
            : null,
        pekerjaanWali: data.pekerjaanWali === "" ? null : data.pekerjaanWali,
        pendidikanWali: data.pendidikanWali === "" ? null : data.pendidikanWali,
        penghasilanWali:
          data.penghasilanWali === "" ? null : data.penghasilanWali ?? null,
        telpWali: data.telpWali === "" ? null : data.telpWali,
        postcode: data.postcode,
        awards: data.awards || null,
        awards_lvl: data.awards_lvl || null,
        awards_date: data.awards_date ? new Date(data.awards_date) : null,
        scholarship: data.scholarship || null,
        scholarship_detail: data.scholarship_detail || null,
        scholarship_date: data.scholarship_date
          ? new Date(data.scholarship_date)
          : null,
        dokumenIjazah: data.dokumenIjazah || null,
        dokumenAkte: data.dokumenAkte || null,
        dokumenPasfoto: data.dokumenPasfoto || null,
        dokumenKKKTP: data.dokumenKKKTP || null,
        isvalid: false,
      },
    });

    return { success: true, error: false };
  } catch (error: any) {
    // Prisma unique constraint error handling
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      let field = "unknown";
      if (Array.isArray(error.meta?.target) && error.meta?.target.length > 0) {
        field = error.meta.target[0];
      }
      return {
        success: false,
        error: true,
        message: field, // return the field name
      };
    }
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
        address: data.address,
        rw: data.rw,
        rt: data.rt,
        kelurahan: data.kelurahan,
        kecamatan: data.kecamatan,
        kota: data.kota,
        religion: data.religion,
        sex: data.sex,
        birthday: new Date(data.birthday),
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
        namaAyah: data.namaAyah === "" ? null : data.namaAyah,
        tahunLahirAyah:
          data.tahunLahirAyah && data.tahunLahirAyah !== ""
            ? new Date(data.tahunLahirAyah)
            : null,
        pekerjaanAyah: data.pekerjaanAyah === "" ? null : data.pekerjaanAyah,
        pendidikanAyah: data.pendidikanAyah === "" ? null : data.pendidikanAyah,
        penghasilanAyah:
          data.penghasilanAyah === "" ? null : data.penghasilanAyah ?? null,
        telpAyah: data.telpAyah === "" ? null : data.telpAyah,
        namaIbu: data.namaIbu === "" ? null : data.namaIbu,
        tahunLahirIbu:
          data.tahunLahirIbu && data.tahunLahirIbu !== ""
            ? new Date(data.tahunLahirIbu)
            : null,
        pekerjaanIbu: data.pekerjaanIbu === "" ? null : data.pekerjaanIbu,
        pendidikanIbu: data.pendidikanIbu === "" ? null : data.pendidikanIbu,
        penghasilanIbu:
          data.penghasilanIbu === "" ? null : data.penghasilanIbu ?? null,
        telpIbu: data.telpIbu === "" ? null : data.telpIbu,
        namaWali: data.namaWali === "" ? null : data.namaWali,
        tahunLahirWali:
          data.tahunLahirWali && data.tahunLahirWali !== ""
            ? new Date(data.tahunLahirWali)
            : null,
        pekerjaanWali: data.pekerjaanWali === "" ? null : data.pekerjaanWali,
        pendidikanWali: data.pendidikanWali === "" ? null : data.pendidikanWali,
        penghasilanWali:
          data.penghasilanWali === "" ? null : data.penghasilanWali ?? null,
        telpWali: data.telpWali === "" ? null : data.telpWali,
        postcode: data.postcode,
        awards: data.awards || null,
        awards_lvl: data.awards_lvl || null,
        awards_date: data.awards_date ? new Date(data.awards_date) : null,
        scholarship: data.scholarship || null,
        scholarship_detail: data.scholarship_detail || null,
        ...(data.dokumenIjazah !== "" && { dokumenIjazah: data.dokumenIjazah }),
        ...(data.dokumenAkte !== "" && { dokumenAkte: data.dokumenAkte }),
        ...(data.dokumenPasfoto !== "" && {
          dokumenPasfoto: data.dokumenPasfoto,
        }),
        ...(data.dokumenKKKTP !== "" && { dokumenKKKTP: data.dokumenKKKTP }),
        isvalid: data.isvalid || false,
      },
    });

    // If isvalid is true, create a new user and student
    if (data.isvalid === true) {
      // Prepare StudentSchema payload
      const studentPayload = {
        id: undefined,
        sdId: "", // You may want to generate or fetch this value
        username: data.nisn + "_student",
        password: `${data.nisn}@Sm2024!`, // Or generate a random password
        name: data.name,
        surname: data.surname ?? "",
        email: data.email,
        phone: data.phone,
        noWa: data.noWhatsapp,
        address: data.address,
        rw: data.rw,
        rt: data.rt,
        kelurahan: data.kelurahan,
        kecamatan: data.kecamatan,
        kota: data.kota,
        religion: data.religion,
        img: null,
        birthday: new Date(data.birthday),
        birthPlace: data.birthPlace,
        sex: data.sex,
        asalSekolah: data.asalSekolah,
        npsn: data.npsn,
        nisn: data.nisn,
        no_ijz: data.no_ijz,
        nik: data.nik,
        postcode: data.postcode,
        transportation: data.transportation,
        tempat_tinggal: data.tempat_tinggal,
        kps: data.kps === "" ? null : data.kps,
        no_kps: data.no_kps ?? null,
        height: data.height,
        weight: data.weight,
        distance_from_home: data.distance_from_home,
        time_from_home: data.time_from_home,
        number_of_siblings: data.number_of_siblings,
        awards: data.awards ?? null,
        awards_lvl: data.awards_lvl ?? null,
        awards_date: data.awards_date ? new Date(data.awards_date) : null,
        scholarship: data.scholarship ?? null,
        scholarship_detail: data.scholarship_detail ?? null,
        dokumenIjazah: data.dokumenIjazah ?? null,
        dokumenAkte: data.dokumenAkte ?? null,
        dokumenPasfoto: data.dokumenPasfoto ?? null,
        dokumenKKKTP: data.dokumenKKKTP ?? null,
        gradeId: data.gradeId ?? 1, // You may want to set this properly
        classId: data.classId ?? 1, // You may want to set this properly
        parentId: null,
      };
      const studentResult = await createStudent(
        { success: false, error: false },
        studentPayload
      );
      const studentId = studentResult?.id;
      function toDegree(val: any): Degree {
        const allowed = [
          "TIDAK_ADA",
          "SD",
          "SMP",
          "SMA",
          "D3",
          "S1",
          "S2",
          "S3",
        ];
        return allowed.includes(val) ? val : "TIDAK_ADA";
      }
      // Create Ayah parent if name exists
      if (data.namaAyah) {
        const ayahPayload = {
          id: undefined,
          username: data.nik + "_ayah",
          password: `${data.nik}@Sm2024!`,
          email: `${data.nik}_ayah@parent.local`,
          name: data.namaAyah,
          surname: "",
          phone: data.telpAyah ?? "",
          birthday: data.tahunLahirAyah
            ? new Date(data.tahunLahirAyah)
            : new Date(1970, 0, 1),
          job: data.pekerjaanAyah ?? "",
          degree: toDegree(data.pendidikanAyah),
          income:
            typeof data.penghasilanAyah === "number" ? data.penghasilanAyah : 0,
          address: data.address,
          sex: "MALE" as "MALE" | "FEMALE",
          students: [studentId!],
        };
        await createParent({ success: false, error: false }, ayahPayload);
      }
      // Create Ibu parent if name exists
      if (data.namaIbu) {
        const ibuPayload = {
          id: undefined,
          username: data.nik + "_ibu",
          password: `${data.nik}@Sm2024!`,
          email: `${data.nik}_ibu@parent.local`,
          name: data.namaIbu,
          surname: "",
          phone: data.telpIbu ?? "",
          birthday: data.tahunLahirIbu
            ? new Date(data.tahunLahirIbu)
            : new Date(1970, 0, 1),
          job: data.pekerjaanIbu ?? "",
          degree: toDegree(data.pendidikanIbu),
          income:
            typeof data.penghasilanIbu === "number" ? data.penghasilanIbu : 0,
          address: data.address,
          sex: "FEMALE" as "MALE" | "FEMALE",
          students: [studentId!],
        };
        await createParent({ success: false, error: false }, ibuPayload);
      }
      // Create Wali parent if name exists
      if (data.namaWali) {
        const waliPayload = {
          id: undefined,
          username: data.nik + "_wali",
          password: `${data.nik}@Sm2024!`,
          email: `${data.nik}_wali@parent.local`,
          name: data.namaWali,
          surname: "",
          phone: data.telpWali ?? "",
          birthday: data.tahunLahirWali
            ? new Date(data.tahunLahirWali)
            : new Date(1970, 0, 1),
          job: data.pekerjaanWali ?? "",
          degree: toDegree(data.pendidikanWali),
          income:
            typeof data.penghasilanWali === "number" ? data.penghasilanWali : 0,
          address: data.address,
          sex: "MALE" as "MALE" | "FEMALE",
          students: [studentId!],
        };
        await createParent({ success: false, error: false }, waliPayload);
      }
    }

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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.pPDB.delete({
      where: {
        id: parseInt(id),
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

    console.error("Delete Ppdb error: ", error);
    return { success: false, error: true, message };
  }
};

export const createMeeting = async (
  currentState: CurrentState,
  data: AttendanceSchema,
  lessonId?: number
) => {
  const resolvedLessonId = lessonId ?? data.lessonId;
  if (!resolvedLessonId) {
    return { success: false, error: true, message: "Missing lessonId" };
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const lesson = await prisma.lesson.findUnique({
      where: { id: resolvedLessonId },
    });

    if (!lesson) {
      return { success: false, error: true, message: "Lesson not found" };
    }

    const dayMap: Record<string, number> = {
      SENIN: 1,
      SELASA: 2,
      RABU: 3,
      KAMIS: 4,
      JUMAT: 5,
    };

    const lessonDayIndex = dayMap[lesson.day]; // 1-5 (Monday to Friday)
    if (!lessonDayIndex) {
      return { success: false, error: true, message: "Invalid lesson day" };
    }

    const lastMeeting = await prisma.meeting.findFirst({
      where: { lessonId: resolvedLessonId },
      orderBy: { meetingNo: "desc" },
    });

    let newDate: Date;
    if (lastMeeting && lastMeeting.date) {
      newDate = new Date(lastMeeting.date);
      newDate.setDate(newDate.getDate() + 7); // Next week, same day
    } else {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 (Sunday) - 6 (Saturday)

      const daysUntilNextLessonDay =
        (lessonDayIndex + 7 - (((dayOfWeek + 6) % 7) + 1)) % 7;
      newDate = new Date();
      newDate.setDate(today.getDate() + daysUntilNextLessonDay);

      newDate.setHours(0, 0, 0, 0);
    }

    const startTime = new Date(newDate);
    startTime.setHours(
      lesson.startTime.getHours(),
      lesson.startTime.getMinutes(),
      0,
      0
    );

    const endTime = new Date(newDate);
    endTime.setHours(
      lesson.endTime.getHours(),
      lesson.endTime.getMinutes(),
      0,
      0
    );

    const nextMeetingNo = (lastMeeting?.meetingNo ?? 0) + 1;

    await prisma.meeting.create({
      data: {
        lessonId: resolvedLessonId,
        meetingNo: nextMeetingNo,
        date: newDate,
        startTime,
        endTime,
      },
    });

    return { success: true, error: false };
  } catch (error) {
    console.error("createMeeting error:", error);
    return {
      success: false,
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    const meetingId = data.meetingId!;
    const lessonId = data.lessonId!;

    await Promise.all(
      Object.entries(data.attendance || {}).map(
        async ([studentId, { status }]) => {
          await prisma.attendance.upsert({
            where: {
              studentId_meetingId: {
                studentId,
                meetingId,
              },
            },
            update: {
              status,
              present: status === "HADIR",
              date: data.date ?? new Date(),
            },
            create: {
              studentId,
              meetingId,
              lessonId,
              date: data.date ?? new Date(),
              status,
              present: status === "HADIR",
            },
          });
        }
      )
    );

    return { success: true, error: false };
  } catch (error) {
    console.error("updateAttendance error:", error);
    return { success: false, error: true, message: "Gagal update attendance." };
  }
};
export const deleteAttendance = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.meeting.delete({
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

// Ambil data siswa, kelas, dan angkatan

// Buat tagihan
export async function createPaymentLog(
  prevState: CurrentState,
  payload: PaymentLogSchema
): Promise<CurrentState> {
  const { role } = await getCurrentUser();
  if (role !== "admin") {
    return {
      success: false,
      error: true,
      message: "Hanya admin yang dapat membuat tagihan.",
    };
  }

  try {
    const { recipientType, recipientId, ...paymentData } = payload;

    let studentIds: string[] = [];
    if (recipientType === "student") {
      studentIds = [recipientId];
    } else if (recipientType === "class") {
      const classData = await prisma.class.findUnique({
        where: { id: parseInt(recipientId) },
        include: { students: { select: { id: true } } },
      });
      studentIds = classData?.students.map((s) => s.id) ?? [];
    } else if (recipientType === "grade") {
      const gradeData = await prisma.grade.findUnique({
        where: { id: parseInt(recipientId) },
        include: { students: { select: { id: true } } },
      });
      studentIds = gradeData?.students.map((s) => s.id) ?? [];
    }

    if (studentIds.length === 0) {
      return {
        success: false,
        error: true,
        message: "Tidak ada siswa yang dipilih untuk tagihan ini.",
      };
    }

    await prisma.paymentLog.createMany({
      data: studentIds.map((studentId) => ({
        studentId,
        amount: paymentData.amount,
        paymentType: paymentData.paymentType,
        status: paymentData.status,
        dueDate: new Date(paymentData.dueDate),
        description: paymentData.description || null,
        paymentMethod: paymentData.paymentMethod || null,
        receiptNumber: paymentData.receiptNumber || null,
        classId: recipientType === "class" ? parseInt(recipientId) : null,
        gradeId: recipientType === "grade" ? parseInt(recipientId) : null,
      })),
    });

    return { success: true, error: false, message: "Tagihan berhasil dibuat." };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Gagal membuat tagihan." };
  }
}

// Update tagihan
export async function updatePaymentLog(
  prevState: CurrentState,
  data: PaymentLogSchema
): Promise<CurrentState> {
  const { role } = await getCurrentUser();
  if (role !== "admin") {
    return {
      success: false,
      error: true,
      message: "Hanya admin yang dapat membuat tagihan.",
    };
  }

  try {
    const { recipientType, recipientId, ...paymentData } = data;

    await prisma.paymentLog.update({
      where: {
        id: data.id,
      },
      data: {
        amount: paymentData.amount,
        paymentType: paymentData.paymentType,
        status: paymentData.status,
        dueDate: new Date(paymentData.dueDate),
        description: paymentData.description || null,
        paymentMethod: paymentData.paymentMethod || null,
        receiptNumber: paymentData.receiptNumber || null,
        classId: recipientType === "class" ? parseInt(recipientId) : null,
        gradeId: recipientType === "grade" ? parseInt(recipientId) : null,
      },
    });

    return { success: true, error: false, message: "Tagihan berhasil dibuat." };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Gagal membuat tagihan." };
  }
}

export const deletePaymentLog = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.paymentLog.delete({
      where: {
        id: parseInt(id),
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di delete Payment server action");
    return { success: false, error: true };
  }
};