"use server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

import { revalidatePath } from "next/cache";
import {
  classSchema,
  ExamSchema,
  StudentSchema,
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
  formData: FormData
): Promise<CurrentState> => {
  const raw = {
    name: formData.get("name") as string,
    teachers: formData.getAll("teachers") as string[],
  };

  const parsed = subjectSchema.safeParse(raw);

  if (!parsed.success) {
    console.log("Validation error:", parsed.error.format());
    return { success: false, error: true };
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.subject.create({
      data: {
        name: parsed.data.name,
        teachers: {
          connect: parsed.data.teachers.map((teacherId) => ({ id: teacherId })),
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
  formData: FormData
): Promise<CurrentState> => {
  const raw = {
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    name: formData.get("name") as string,
    teachers: formData.getAll("teachers") as string[],
  };

  const parsed = subjectSchema.safeParse(raw);
  console.log(parsed.data + " SubjectSchema");

  if (!parsed.success) {
    console.log("Validation error:", parsed.error.format());
    return { success: false, error: true };
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.subject.update({
      where: {
        id: parsed.data.id,
      },
      data: {
        name: parsed.data.name,
        teachers: {
          set: parsed.data.teachers.map((teacherId) => ({ id: teacherId })),
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
  formData: FormData
): Promise<CurrentState> => {
  const raw = {
    name: formData.get("name") as string,
    capacity: formData.get("capacity")
      ? Number(formData.get("capacity"))
      : undefined,
    gradeId: formData.get("gradeId")
      ? Number(formData.get("gradeId"))
      : undefined,
    supervisorId: formData.get("supervisorId") as string,
  };

  const parsed = classSchema.safeParse(raw);

  if (!parsed.success) {
    console.log("Validation error:", parsed.error.format());
    return { success: false, error: true };
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.class.create({
      data: parsed.data,
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  const raw = {
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    name: formData.get("name") as string,
    capacity: formData.get("capacity")
      ? Number(formData.get("capacity"))
      : undefined,
    gradeId: formData.get("gradeId")
      ? Number(formData.get("gradeId"))
      : undefined,
    supervisorId: formData.get("supervisorId") as string,
  };

  const parsed = classSchema.safeParse(raw);
  console.log(parsed.data + " ClassSchema");

  if (!parsed.success) {
    console.log("Validation error:", parsed.error.format());
    return { success: false, error: true };
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.class.update({
      where: {
        id: parsed.data.id,
      },
      data: parsed.data,
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
  // const raw = {
  //   name: formData.get("name") as string,
  //   capacity: formData.get("capacity")
  //     ? Number(formData.get("capacity"))
  //     : undefined,
  //   gradeId: formData.get("gradeId")
  //     ? Number(formData.get("gradeId"))
  //     : undefined,
  //   supervisorId: formData.get("supervisorId") as string,
  // };

  // const parsed = teacherSchema.safeParse(raw);

  // if (!parsed.success) {
  //   console.log("Validation error:", parsed.error.format());
  //   return { success: false, error: true };

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
        img: data.img || null,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  // const id = formData.get("id") as string;

  // const raw = {
  //   id: formData.get("id") ? Number(formData.get("id")) : undefined,
  //   name: formData.get("name") as string,
  //   capacity: formData.get("capacity")
  //     ? Number(formData.get("capacity"))
  //     : undefined,
  //   gradeId: formData.get("gradeId")
  //     ? Number(formData.get("gradeId"))
  //     : undefined,
  //   supervisorId: formData.get("supervisorId") as string,
  // };

  // const parsed = teacherSchema.safeParse(raw);
  // console.log(parsed.data + " teacherSchema");

  // if (!parsed.success) {
  //   console.log("Validation error:", parsed.error.format());
  //   return { success: false, error: true };
  // }

  try {
    if (!data.id) {
      console.log(data.id + "Data.id");

      return { success: false, error: true, message: "Missing teacher ID" };
    }
    const user = await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        id: user.id,
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
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
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

    const deletedUser = await client.users.deleteUser(id);

    if (deletedUser) {
      console.log("✅ User Sucessfully deleted:", deletedUser.id);
    } else {
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
  // const raw = {
  //   name: formData.get("name") as string,
  //   capacity: formData.get("capacity")
  //     ? Number(formData.get("capacity"))
  //     : undefined,
  //   gradeId: formData.get("gradeId")
  //     ? Number(formData.get("gradeId"))
  //     : undefined,
  //   supervisorId: formData.get("supervisorId") as string,
  // };

  // const parsed = StudentSchema.safeParse(raw);

  // if (!parsed.success) {
  //   console.log("Validation error:", parsed.error.format());
  //   return { success: false, error: true };
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
        img: data.img || null,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error + " Di server action");
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  // const id = formData.get("id") as string;

  // const raw = {
  //   id: formData.get("id") ? Number(formData.get("id")) : undefined,
  //   name: formData.get("name") as string,
  //   capacity: formData.get("capacity")
  //     ? Number(formData.get("capacity"))
  //     : undefined,
  //   gradeId: formData.get("gradeId")
  //     ? Number(formData.get("gradeId"))
  //     : undefined,
  //   supervisorId: formData.get("supervisorId") as string,
  // };

  // const parsed = StudentSchema.safeParse(raw);
  // console.log(parsed.data + " StudentSchema");

  // if (!parsed.success) {
  //   console.log("Validation error:", parsed.error.format());
  //   return { success: false, error: true };
  // }

  try {
    if (!data.id) {
      console.log(data.id + "Data.id");

      return { success: false, error: true, message: "Missing student ID" };
    }
    const user = await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        id: user.id,
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

    const deletedUser = await client.users.deleteUser(id);

    if (deletedUser) {
      console.log("✅ User Sucessfully deleted:", deletedUser.id);
    } else {
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
