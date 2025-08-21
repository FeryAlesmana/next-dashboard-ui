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
  MpaymentLogSchema,
  MstudentSchema,
  mteacherSchema,
  MteacherSchema,
  PaymentLogSchema,
  PpdbSchema,
  ResultSchema,
  SubjectSchema,
  CreatestudentSchema,
  UpdatestudentSchema,
  CreateparentSchema,
  UpdateparentSchema,
  CreateteacherSchema,
  UpdateteacherSchema,
  MparentSchema,
  mparentSchema,
  MresultSchema,
  MassignmentSchema,
  MexamSchema,
} from "./formValidationSchema";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import extractCloudinaryPublicId, { getCurrentUser } from "./utils";
import { Degree, parents, Prisma } from "@prisma/client";
import { encryptPassword } from "./utils";

export type CurrentState = {
  success: boolean;
  error: boolean;
  message?: string;
  id?: string;
  data?: any;
};
const client = await clerkClient();

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const createdSubject = await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
      include: {
        teachers: true,
      },
    });
    return { success: true, error: false, data: createdSubject };
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
    const updatedSubject = await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
      include: {
        teachers: true,
      },
    });
    return { success: true, error: false, data: updatedSubject };
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

export const deleteSubjects = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return { success: false, error: true, message: "No student IDs provided." };
  }

  try {
    for (const id of ids) {
      const idAsNumber = parseInt(id);
      try {
        await prisma.subject.delete({ where: { id: idAsNumber } });
      } catch (innerError) {
        console.error(`❌ Failed to delete Subject ID ${id}:`, innerError);
        // Optionally continue deleting others instead of failing all
      }
    }

    return {
      success: true,
      error: false,
      message: `Deleted ${ids.length} Subject(s) successfully.`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    return { success: false, error: true, message };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
): Promise<CurrentState> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const createdClass = await prisma.class.create({
      data: data,
      include: {
        supervisor: true,
      },
    });
    return { success: true, error: false, data: createdClass };
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
    const updatedClass = await prisma.class.update({
      where: {
        id: data.id,
      },
      data: data,
      include: {
        supervisor: true,
      },
    });
    return { success: true, error: false, data: updatedClass };
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
export const deleteClasses = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return { success: false, error: true, message: "No student IDs provided." };
  }

  try {
    for (const id of ids) {
      const idAsNumber = parseInt(id);
      try {
        await prisma.class.delete({ where: { id: idAsNumber } });
      } catch (innerError) {
        console.error(`❌ Failed to delete class ID ${id}:`, innerError);
        // Optionally continue deleting others instead of failing all
      }
    }

    return {
      success: true,
      error: false,
      message: `Deleted ${ids.length} class(es) successfully.`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    return { success: false, error: true, message };
  }
};
export const createTeacher = async (
  currentState: CurrentState,
  data: CreateteacherSchema
) => {
  try {
    const user = await client.users.createUser({
      username: data.username,
      password: encryptPassword(data.password!),
      firstName: data.name,
      lastName: data.namalengkap,
      publicMetadata: { role: "teacher" },
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const createdTeacher = await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        password: encryptPassword(data.password!),
        name: data.name,
        namalengkap: data.namalengkap,
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
      include: {
        subjects: { select: { id: true, name: true } },
        classes: true,
        lessons: true,
      },
    });

    return { success: true, error: false, data: createdTeacher };
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
  data: UpdateteacherSchema
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
        ...(data.password !== "" && {
          password: encryptPassword(data.password!),
        }),
        firstName: data.name,
        lastName: data.namalengkap,
      });
      if (user) {
        console.log("✅ User Sucessfully Updated:", user.id);
      }
    } catch (error) {
      console.warn(
        "⚠️ Clerk returned no user info. Attempting to create user..."
      );
      // Create new Clerk user if update fails
      user = await client.users.createUser({
        username: data.username,
        password:
          data.password !== "" ? encryptPassword(data.password!) : undefined,
        firstName: data.name,
        lastName: data.namalengkap,
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
        id: user?.id || data.id,
        username: data.username,
        ...(data.password !== "" && {
          password: encryptPassword(data.password!),
        }),
        name: data.name,
        namalengkap: data.namalengkap,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        img: data.img ?? null, // <-- Always set explicitly
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
    const updatedTeacher = prisma.teacher.findUnique({
      where: { id: user?.id || data.id },
      include: {
        subjects: { select: { id: true, name: true } },
        classes: true,
        lessons: true,
      },
    });
    return { success: true, error: false, data: updatedTeacher };
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

export async function updateManyTeachers(
  prevState: { success: boolean; error: boolean; message?: string },
  data: MteacherSchema
): Promise<CurrentState> {
  try {
    const parsed = mteacherSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: true,
        message: "Validasi gagal. Mohon isi semua data dengan benar.",
      };
    }

    const { ids, subjects = [], lessons = [] } = parsed.data;

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await Promise.all(
      ids.map((id: string) =>
        prisma.teacher.update({
          where: { id },
          data: {
            subjects: {
              set: subjects.map((subjectId) => ({ id: subjectId })),
            },
            lessons: {
              set: lessons.map((lessonId) => ({ id: lessonId })),
            },
          },
        })
      )
    );
    const updatedTeachers = await prisma.teacher.findMany({
      where: { id: { in: ids } },
      include: {
        subjects: { select: { id: true, name: true } },
        classes: true,
        lessons: true,
      },
    });
    return {
      success: true,
      error: false,
      message: "Berhasil memperbarui guru.",
      data: updatedTeachers,
    };
  } catch (error: any) {
    console.error("UpdateManyTeacher error:", error);
    return {
      success: false,
      error: true,
      message: "Terjadi kesalahan saat memperbarui data.",
    };
  }
}

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
export const deleteTeachers = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return { success: false, error: true, message: "No student IDs provided." };
  }

  try {
    for (const id of ids) {
      try {
        const teacher = await prisma.teacher.findUnique({ where: { id } });

        if (teacher?.img) {
          const publicId = extractCloudinaryPublicId(teacher.img);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            console.log("Cloudinary image deleted:", publicId);
          }
        }

        await prisma.teacher.delete({ where: { id } });

        try {
          const deletedUser = await client.users.deleteUser(id);
          if (deletedUser) {
            console.log("✅ Clerk user deleted:", deletedUser.id);
          }
        } catch {
          console.warn(`⚠️ Clerk user ${id} not found or already deleted.`);
        }
      } catch (innerError) {
        console.error(`❌ Failed to delete teacher ID = ${id}:`, innerError);
        // Optionally continue deleting others instead of failing all
      }
    }

    return {
      success: true,
      error: false,
      message: `Deleted ${ids.length} Payment(s) successfully.`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    return { success: false, error: true, message };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: CreatestudentSchema
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
      password: encryptPassword(data.password),
      firstName: data.name,
      lastName: data.namalengkap,
      publicMetadata: { role: "student" },
    });
    console.log("Trying to createUser");

    // if (!user || !user.id) {
    //   return { success: false, error: true, message: "Failed to create user" };
    // }

    console.log(user.id, "userId in createStudent");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const createdStudent = await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        password: encryptPassword(data.password),
        name: data.name,
        namalengkap: data.namalengkap,
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
        student_details: {
          create: {
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
        },
      },
      include: {
        student_details: true,
      },
    });
    return { success: true, error: false, id: user.id, data: createdStudent };
  } catch (error: any) {
    console.error("Create student failed:", error);
    if (error?.errors) {
      console.error("Clerk errors:", JSON.stringify(error.errors, null, 2));
    }
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
  data: UpdatestudentSchema
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
        ...(data.password !== "" && {
          password: encryptPassword(data.password!),
        }),
        firstName: data.name,
        lastName: data.namalengkap,
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
        password:
          data.password !== "" ? encryptPassword(data.password!) : undefined,
        firstName: data.name,
        lastName: data.namalengkap,
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
        ...(data.password !== "" && {
          password: encryptPassword(data.password!),
        }),
        name: data.name,
        namalengkap: data.namalengkap,
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

export async function updateManyStudents(
  prevState: { success: boolean; error: boolean; message?: string },
  payload: MstudentSchema
) {
  try {
    // Get the gradeId from the selected class
    const classData = await prisma.class.findUnique({
      where: { id: parseInt(payload.classId) },
      select: { gradeId: true },
    });

    if (!classData || !classData.gradeId) {
      return {
        success: false,
        error: true,
        message: "Kelas atau grade tidak ditemukan.",
      };
    }

    // Update all selected students
    await prisma.student.updateMany({
      where: { id: { in: payload.ids } },
      data: {
        classId: parseInt(payload.classId),
        gradeId: classData.gradeId,
      },
    });
    const updatedStudents = await prisma.student.findMany({
      where: { id: { in: payload.ids } },
      include: {
        student_details: true,
        class: true,
        grade: true,
      },
    });
    return {
      success: true,
      error: false,
      message: "Berhasil mengupdate siswa.",
      data: updatedStudents,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: true,
      message: "Gagal mengupdate siswa.",
    };
  }
}

export const deleteStudents = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return { success: false, error: true, message: "No student IDs provided." };
  }

  try {
    for (const id of ids) {
      try {
        const student = await prisma.student.findUnique({ where: { id } });

        if (student?.img) {
          const publicId = extractCloudinaryPublicId(student.img);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            console.log("Cloudinary image deleted:", publicId);
          }
        }

        await prisma.student.delete({ where: { id } });

        try {
          const deletedUser = await client.users.deleteUser(id);
          if (deletedUser) {
            console.log("✅ Clerk user deleted:", deletedUser.id);
          }
        } catch {
          console.warn(`⚠️ Clerk user ${id} not found or already deleted.`);
        }
      } catch (innerError) {
        console.error(`❌ Failed to delete student ID ${id}:`, innerError);
        // Optionally continue deleting others instead of failing all
      }
    }

    return {
      success: true,
      error: false,
      message: `Deleted ${ids.length} student(s) successfully.`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

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
    const createEx = await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
        exType: data.exType,
      },
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, namalengkap: true } },
            class: { select: { name: true } },
          },
        },
      },
    });
    return { success: true, error: false, data: createEx };
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
        exType: data.exType,
      },
    });

    const updatedExam = await prisma.exam.findUnique({
      where: { id: data.id },
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, namalengkap: true } },
            class: { select: { name: true } },
          },
        },
      },
    });
    return { success: true, error: false, data: updatedExam };
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

export const updateExams = async (
  currentState: CurrentState,
  data: MexamSchema // your bulk update schema including `ids: number[]`
) => {
  try {
    const { ids, startTime, endTime, exType, title } = data;

    if (!ids || ids.length === 0) {
      throw new Error("No result IDs provided for update");
    }
    //Only Update if there is at least one field to update
    const updateData: any = {
      ...(title !== "" && {
        title: title,
      }),
      ...(startTime !== "" && {
        startTime: startTime,
      }),
      ...(endTime !== "" && {
        endTime: endTime,
      }),
      ...(exType !== "" && {
        exType: exType,
      }),
    };

    await prisma.exam.updateMany({
      where: {
        id: { in: ids },
      },
      data: updateData,
    });

    const updatedExams = await prisma.exam.findMany({
      where: { id: { in: ids } },
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, namalengkap: true, id: true } },
            class: { select: { name: true, grade: true } },
          },
        },
      },
    });

    return { success: true, error: false, data: updatedExams };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("updateExams error: ", error);
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

export const deleteExams = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return { success: false, error: true, message: "No student IDs provided." };
  }

  try {
    for (const id of ids) {
      const idAsNumber = parseInt(id);
      try {
        await prisma.exam.delete({ where: { id: idAsNumber } });
      } catch (innerError) {
        console.error(`❌ Failed to delete Exam ID ${id}:`, innerError);
        // Optionally continue deleting others instead of failing all
      }
    }
    revalidatePath("list/exams");
    return {
      success: true,
      error: false,
      message: `Deleted ${ids.length} Exam(s) successfully.`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    return { success: false, error: true, message };
  }
};
export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    const createEvent = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId,
      },
    });
    return { success: true, error: false, data: createEvent };
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
    const updateEvent = await prisma.event.update({
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
    return { success: true, error: false, data: updateEvent };
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
    const createAss = await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: new Date(),
        dueDate: data.dueDate,
        lessonId: data.lessonId,
        assType: data.assType,
      },
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, namalengkap: true, id: true } },
            class: { select: { name: true, grade: true } },
          },
        },
      },
    });

    return { success: true, error: false, data: createAss };
  } catch (error) {
    console.error("Create Tugas error: ", error);
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
        assType: data.assType,
      },
    });
    const updateAss = await prisma.assignment.findUnique({
      where: {
        id: data.id,
      },
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, namalengkap: true, id: true } },
            class: { select: { name: true, grade: true } },
          },
        },
      },
    });
    return { success: true, error: false, data: updateAss };
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

export const updateAssignments = async (
  currentState: CurrentState,
  data: MassignmentSchema // your bulk update schema including `ids: number[]`
) => {
  try {
    const { ids, dueDate, assType, title } = data;

    if (!ids || ids.length === 0) {
      throw new Error("No result IDs provided for update");
    }
    //Only Update if there is at least one field to update
    const updateData: any = {
      ...(title !== "" && {
        title: title,
      }),
      ...(dueDate !== "" && {
        dueDate: dueDate,
      }),
      ...(assType !== "" && {
        assType: assType,
      }),
    };

    await prisma.assignment.updateMany({
      where: {
        id: { in: ids },
      },
      data: updateData,
    });

    const updatedAssignments = await prisma.assignment.findMany({
      where: { id: { in: ids } },
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, namalengkap: true, id: true } },
            class: { select: { name: true, grade: true } },
          },
        },
      },
    });

    return { success: true, error: false, data: updatedAssignments };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("updateAssignments error: ", error);
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

export const deleteAssignments = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return { success: false, error: true, message: "No student IDs provided." };
  }

  try {
    for (const id of ids) {
      const idAsNumber = parseInt(id);
      try {
        await prisma.assignment.delete({ where: { id: idAsNumber } });
      } catch (innerError) {
        console.error(`❌ Failed to delete Assignment ID ${id}:`, innerError);
        // Optionally continue deleting others instead of failing all
      }
    }

    return {
      success: true,
      error: false,
      message: `Deleted ${ids.length} Assignment(s) successfully.`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    return { success: false, error: true, message };
  }
};

export const createParent = async (
  currentState: CurrentState,
  data: CreateparentSchema
) => {
  try {
    const user = await client.users.createUser({
      username: data.username,
      password: encryptPassword(data.password),
      firstName: data.name,
      lastName: data.namalengkap,
      publicMetadata: { role: "parent" },
    });
    if (user) {
      console.log("✅ User Sucessfully created:", user.id);
    } else {
      console.warn(
        "⚠️ Clerk returned no user info. User may already be created?"
      );
    }

    let studentField;

    switch (data.waliMurid) {
      case "AYAH":
        studentField = {
          students: {
            connect: data.students.map((studentId) => ({ id: studentId })),
          },
        };
        break;
      case "IBU":
        studentField = {
          secondaryStudents: {
            connect: data.students.map((studentId) => ({ id: studentId })),
          },
        };
        break;
      case "WALI":
        studentField = {
          guardianStudents: {
            connect: data.students.map((studentId) => ({ id: studentId })),
          },
        };
        break;

      default:
        studentField = {};
        break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const createdParent = await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        password: encryptPassword(data.password),
        name: data.name,
        namalengkap: data.namalengkap,
        email: data.email,
        sex: data.sex,
        waliMurid: data.waliMurid,
        birthday: new Date(data.birthday),
        job: data.job,
        income: data.income,
        degree: data.degree,
        phone: data.phone,
        address: data.address,
        ...studentField,
      },
      include: {
        students: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
        secondaryStudents: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
        guardianStudents: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
      },
    });
    return { success: true, error: false, id: user.id, data: createdParent };
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
  data: UpdateparentSchema
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
        ...(data.password !== "" && {
          password: encryptPassword(data.password!),
        }),
        firstName: data.name,
        lastName: data.namalengkap,
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
        password:
          data.password !== "" ? encryptPassword(data.password!) : undefined,
        firstName: data.name,
        lastName: data.namalengkap,
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
    let studentField;

    switch (data.waliMurid) {
      case "AYAH":
        studentField = {
          students: {
            set: data.students.map((studentId) => ({ id: studentId })),
          },
        };
        break;
      case "IBU":
        studentField = {
          secondaryStudents: {
            set: data.students.map((studentId) => ({ id: studentId })),
          },
        };
        break;
      case "WALI":
        studentField = {
          guardianStudents: {
            set: data.students.map((studentId) => ({ id: studentId })),
          },
        };
        break;

      default:
        studentField = {};
        break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        id: user.id,
        username: data.username,
        ...(data.password !== "" && {
          password: encryptPassword(data.password!),
        }),
        name: data.name,
        namalengkap: data.namalengkap,
        birthday: new Date(data.birthday),
        email: data.email,
        phone: data.phone,
        address: data.address,
        waliMurid: data.waliMurid,
        sex: data.sex,
        ...studentField,
      },
    });
    const updatedParent = await prisma.parent.findUnique({
      where: { id: data.id },
      include: {
        students: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
        secondaryStudents: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
        guardianStudents: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
      },
    });
    return { success: true, error: false, data: updatedParent };
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

export async function updateManyParents(
  prevState: { success: boolean; error: boolean; message?: string },
  data: MparentSchema
): Promise<CurrentState> {
  try {
    const parsed = mparentSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: true,
        message: "Validasi gagal. Mohon isi semua data dengan benar.",
      };
    }

    const { ids, students = [], address } = parsed.data;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await Promise.all(
      ids.map(async (id: string) => {
        // Find the waliMurid type for this parent
        const parent = await prisma.parent.findUnique({
          where: { id },
          select: { waliMurid: true },
        });

        if (!parent) return;

        // Decide which relation to update
        let studentField: Record<string, any> = {};
        switch (parent.waliMurid) {
          case "AYAH":
            studentField = {
              students: {
                set: students.map((sid) => ({ id: sid })),
              },
            };
            break;
          case "IBU":
            studentField = {
              secondaryStudents: {
                set: students.map((sid) => ({ id: sid })),
              },
            };
            break;
          case "WALI":
            studentField = {
              guardianStudents: {
                set: students.map((sid) => ({ id: sid })),
              },
            };
            break;
        }

        // Perform the update
        return prisma.parent.update({
          where: { id },
          data: {
            address,
            ...studentField,
          },
        });
      })
    );

    const updatedParents = await prisma.parent.findMany({
      where: { id: { in: ids } },
      include: {
        students: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
        secondaryStudents: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
        guardianStudents: {
          include: {
            class: { select: { id: true, name: true, grade: true } },
          },
        },
      },
    });

    return {
      success: true,
      error: false,
      message: "Berhasil memperbarui wali murid.",
      data: updatedParents,
    };
  } catch (error: any) {
    console.error("UpdateManyParent error:", error);
    return {
      success: false,
      error: true,
      message: "Terjadi kesalahan saat memperbarui data.",
    };
  }
}

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
    // await prisma.student.updateMany({
    //   where: { parentId: id },
    //   data: { parentId: "-" },
    // });
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
    revalidatePath("/list/parents");

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
export const deleteParents = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return { success: false, error: true, message: "No student IDs provided." };
  }

  try {
    for (const id of ids) {
      try {
        await prisma.parent.delete({ where: { id } });

        try {
          const deletedUser = await client.users.deleteUser(id);
          if (deletedUser) {
            console.log("✅ Clerk user deleted:", deletedUser.id);
          }
        } catch {
          console.warn(`⚠️ Clerk user ${id} not found or already deleted.`);
        }
      } catch (innerError) {
        console.error(`❌ Failed to delete parent ID = ${id}:`, innerError);
        // Optionally continue deleting others instead of failing all
      }
    }

    return {
      success: true,
      error: false,
      message: `Deleted ${ids.length} Payment(s) successfully.`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

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

export const deleteLessons = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return { success: false, error: true, message: "No student IDs provided." };
  }

  try {
    for (const id of ids) {
      const idAsNumber = parseInt(id);
      try {
        await prisma.lesson.delete({ where: { id: idAsNumber } });
      } catch (innerError) {
        console.error(`❌ Failed to delete Lesson ID ${id}:`, innerError);
        // Optionally continue deleting others instead of failing all
      }
    }

    return {
      success: true,
      error: false,
      message: `Deleted ${ids.length} Lesson(s) successfully.`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    return { success: false, error: true, message };
  }
};

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    const createdResult = await prisma.result.create({
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
        resultType: data.resultType,
      },
      include: {
        student: { select: { name: true, namalengkap: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true, gradeId: true } },
                teacher: { select: { name: true, namalengkap: true } },
                subject: true,
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true, gradeId: true } },
                teacher: { select: { name: true, namalengkap: true } },
                subject: true,
              },
            },
          },
        },
      },
    });
    return { success: true, error: false, data: createdResult };
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
        resultType: data.resultType,
      },
    });
    const updatedResult = await prisma.result.findUnique({
      where: { id: data.id },
      include: {
        student: { select: { name: true, namalengkap: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true, gradeId: true } },
                teacher: { select: { name: true, namalengkap: true } },
                subject: true,
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true, gradeId: true } },
                teacher: { select: { name: true, namalengkap: true } },
                subject: true,
              },
            },
          },
        },
      },
    });
    return { success: true, error: false, data: updatedResult };
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

export const deleteResults = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return { success: false, error: true, message: "No student IDs provided." };
  }

  try {
    for (const id of ids) {
      const idAsNumber = parseInt(id);
      try {
        await prisma.result.delete({ where: { id: idAsNumber } });
      } catch (innerError) {
        console.error(`❌ Failed to delete Result ID ${id}:`, innerError);
        // Optionally continue deleting others instead of failing all
      }
    }

    return {
      success: true,
      error: false,
      message: `Deleted ${ids.length} Result(s) successfully.`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    return { success: false, error: true, message };
  }
};

export const updateResults = async (
  currentState: CurrentState,
  data: MresultSchema // your bulk update schema including `ids: number[]`
) => {
  try {
    const { ids, score, resultType, selectedType, examId, assignmentId } = data;

    if (!ids || ids.length === 0) {
      throw new Error("No result IDs provided for update");
    }

    // Prepare common data to update based on selectedType
    const updateData: any = {
      score,
      resultType,
    };

    if (selectedType === "Ujian") {
      updateData.examId = examId;
      updateData.assignmentId = null;
    } else if (selectedType === "Tugas") {
      updateData.assignmentId = assignmentId;
      updateData.examId = null;
    }

    // Prisma does not have a native "updateMany" that sets different values per record,
    // but here all records get the same data.

    await prisma.result.updateMany({
      where: {
        id: { in: ids },
      },
      data: updateData,
    });

    const updatedResults = await prisma.result.findMany({
      where: { id: { in: ids } },
      include: {
        student: { select: { name: true, namalengkap: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true, gradeId: true } },
                teacher: { select: { name: true, namalengkap: true } },
                subject: true,
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true, gradeId: true } },
                teacher: { select: { name: true, namalengkap: true } },
                subject: true,
              },
            },
          },
        },
      },
    });
    return { success: true, error: false, data: updatedResults };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("updateManyResults error: ", error);
    return { success: false, error: true, message };
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
        namalengkap: data.name,
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
        namalengkap: data.name,
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
        sdId: "", // You may want to generate or fetch this value
        username: data.name + "_student",
        password: data.nisn, // Or generate a random password
        name: data.name,
        namalengkap: data.namalengkap ?? "",
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
        img: data.dokumenPasfoto ?? null,
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
      let parentIdToAssign: string | null = null;
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
      if (!studentId) {
        throw new Error("Student ID not found — cannot link parent.");
      }
      // if (studentId) {
      //   await prisma.student.update({
      //     where: { id: studentId! },
      //     data: { parentId: parentIdToAssign },
      //   });
      // }
      // Create Ayah parent if name exists
      if (data.namaAyah) {
        const ayahPayload = {
          id: undefined,
          username: data.nik + "_ayah",
          password: `${data.nik}@ayah`,
          email: `${data.nik}_ayah@parent.local`,
          name: data.namaAyah,
          namalengkap: "",
          phone: data.telpAyah ?? "",
          birthday: data.tahunLahirAyah
            ? new Date(data.tahunLahirAyah)
            : new Date(1970, 0, 1),
          job: data.pekerjaanAyah ?? "",
          degree: toDegree(data.pendidikanAyah),
          waliMurid: "AYAH" as parents,
          income:
            typeof data.penghasilanAyah === "number" ? data.penghasilanAyah : 0,
          address: data.address,
          sex: "MALE" as "MALE" | "FEMALE",
          students: [studentId!],
        };
        const ayahResult = await createParent(
          { success: false, error: false },
          ayahPayload
        );

        if (!parentIdToAssign && ayahResult?.id) {
          parentIdToAssign = ayahResult.id;
        }
      }
      // Create Ibu parent if name exists
      if (data.namaIbu) {
        const ibuPayload = {
          id: undefined,
          username: data.nik + "_ibu",
          password: `${data.nik}@ibu`,
          email: `${data.nik}_ibu@parent.local`,
          name: data.namaIbu,
          namalengkap: "",
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
          waliMurid: "IBU" as parents,
          students: [studentId!],
        };
        const ibuResult = await createParent(
          { success: false, error: false },
          ibuPayload
        );

        if (!parentIdToAssign && ibuResult?.id) {
          parentIdToAssign = ibuResult.id;
        }
      }
      // Create Wali parent if name exists
      if (data.namaWali) {
        const waliPayload = {
          id: undefined,
          username: data.nik + "_wali",
          password: `${data.nik}@wali`,
          email: `${data.nik}_wali@parent.local`,
          name: data.namaWali,
          namalengkap: "",
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
          waliMurid: "WALI" as parents,
          students: [studentId!],
        };
        const waliResult = await createParent(
          { success: false, error: false },
          waliPayload
        );

        if (!parentIdToAssign && waliResult?.id) {
          parentIdToAssign = waliResult.id;
        }
      }
      if (parentIdToAssign) {
        await prisma.student.update({
          where: { id: studentId! },
          data: { parentId: parentIdToAssign },
        });
      }
    }
    const updatedPpdb = await prisma.pPDB.findUnique({
      where: { id: data.id },
    });

    return { success: true, error: false, data: updatedPpdb };
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

export const deletePPDBs = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return { success: false, error: true, message: "No student IDs provided." };
  }

  try {
    for (const id of ids) {
      const idAsNumber = parseInt(id);
      try {
        await prisma.pPDB.delete({ where: { id: idAsNumber } });
      } catch (innerError) {
        console.error(`❌ Failed to delete pPDB ID ${id}:`, innerError);
        // Optionally continue deleting others instead of failing all
      }
    }

    return {
      success: true,
      error: false,
      message: `Deleted ${ids.length} pPDB(es) successfully.`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

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
    if (!data.meetingCount) {
      return {
        success: false,
        error: true,
        message: "meeting count not found",
      };
    }

    const dayMap: Record<string, number> = {
      SENIN: 1,
      SELASA: 2,
      RABU: 3,
      KAMIS: 4,
      JUMAT: 5,
    };

    const lessonDayIndex = dayMap[lesson.day];
    if (!lessonDayIndex) {
      return { success: false, error: true, message: "Invalid lesson day" };
    }

    const lastMeeting = await prisma.meeting.findFirst({
      where: { lessonId: resolvedLessonId },
      orderBy: { meetingNo: "desc" },
    });

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) - 6 (Saturday)
    const daysUntilNextLessonDay =
      (lessonDayIndex + 7 - (((dayOfWeek + 6) % 7) + 1)) % 7;

    const baseDate = new Date();
    baseDate.setDate(today.getDate() + daysUntilNextLessonDay);
    baseDate.setHours(0, 0, 0, 0);

    const meetingCount = data.meetingCount ?? 1;
    const meetingsData = [];

    for (let i = 0; i < meetingCount; i++) {
      const meetingNo = (lastMeeting?.meetingNo ?? 0) + i + 1;

      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i * 7);

      const startTime = new Date(date);
      startTime.setHours(
        lesson.startTime.getHours(),
        lesson.startTime.getMinutes(),
        0,
        0
      );

      const endTime = new Date(date);
      endTime.setHours(
        lesson.endTime.getHours(),
        lesson.endTime.getMinutes(),
        0,
        0
      );

      meetingsData.push({
        lessonId: resolvedLessonId,
        meetingNo,
        date,
        startTime,
        endTime,
      });
    }

    await prisma.meeting.createMany({
      data: meetingsData,
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
      studentIds = [recipientId as string];
    } else if (recipientType === "class") {
      const classData = await prisma.class.findUnique({
        where: { id: recipientId as number },
        include: { students: { select: { id: true } } },
      });
      studentIds = classData?.students.map((s) => s.id) ?? [];
    } else if (recipientType === "grade") {
      const gradeData = await prisma.grade.findUnique({
        where: { id: recipientId as number },
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

    // ✅ Fetch classId and gradeId for each student
    const studentData = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true,
        classId: true,
        gradeId: true,
      },
    });

    // ✅ Create payment logs with both classId and gradeId from the student itself
    await prisma.paymentLog.createMany({
      data: studentData.map((student) => ({
        studentId: student.id,
        amount: paymentData.amount,
        paymentType: paymentData.paymentType,
        status: paymentData.status,
        dueDate: new Date(paymentData.dueDate),
        description: paymentData.description || null,
        paymentMethod: paymentData.paymentMethod || null,
        receiptNumber: paymentData.receiptNumber || null,
        classId: student.classId,
        gradeId: student.gradeId,
      })),
    });
    const createdPayments = await prisma.paymentLog.findMany({
      where: {
        studentId: { in: studentData.map((s) => s.id) },
        paymentType: paymentData.paymentType,
        dueDate: new Date(paymentData.dueDate),
      },
      include: {
        student: {
          select: {
            name: true,
            namalengkap: true,
            img: true,
            class: {
              select: {
                name: true,
              },
            },
            student_details: { select: { nisn: true } },
          },
        },
      },
    });
    return {
      success: true,
      error: false,
      message: "Tagihan berhasil dibuat.",
      data: createdPayments,
    };
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

    let classId: number | null = null;
    let gradeId: number | null = null;

    if (recipientType === "class") {
      const classData = await prisma.class.findUnique({
        where: { id: recipientId as number },
        include: { grade: true },
      });
      classId = classData?.id ?? null;
      gradeId = classData?.gradeId ?? null;
    } else if (recipientType === "grade") {
      gradeId = recipientId as number;
    } else if (recipientType === "student") {
      const student = await prisma.student.findUnique({
        where: { id: recipientId as string },
        select: { classId: true, gradeId: true },
      });
      classId = student?.classId ?? null;
      gradeId = student?.gradeId ?? null;
    }

    const updatedPayment = await prisma.paymentLog.update({
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
        classId,
        gradeId,
      },
      include: {
        student: {
          select: {
            name: true,
            namalengkap: true,
            img: true,
            class: {
              select: {
                name: true,
              },
            },
            student_details: { select: { nisn: true } },
          },
        },
      },
    });

    return {
      success: true,
      error: false,
      message: "Tagihan berhasil diperbarui.",
      data: updatedPayment,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: true,
      message: "Gagal memperbarui tagihan.",
    };
  }
}

export async function updatePaymentLogs(
  prevState: CurrentState,
  data: MpaymentLogSchema
): Promise<CurrentState> {
  const { role } = await getCurrentUser();
  if (role !== "admin") {
    return {
      success: false,
      error: true,
      message: "Hanya admin yang dapat mengubah tagihan.",
    };
  }
  console.log(data.ids, "Ids in actions");
  try {
    const { recipientType, recipientId, ids, ...paymentData } = data;

    let classId: number | null = null;
    let gradeId: number | null = null;

    if (recipientType === "class") {
      const classData = await prisma.class.findUnique({
        where: { id: recipientId as number },
        include: { grade: true },
      });
      classId = classData?.id ?? null;
      gradeId = classData?.gradeId ?? null;
    } else if (recipientType === "grade") {
      gradeId = recipientId as number;
    } else if (recipientType === "student") {
      const student = await prisma.student.findUnique({
        where: { id: recipientId as string },
        select: { classId: true, gradeId: true },
      });
      classId = student?.classId ?? null;
      gradeId = student?.gradeId ?? null;
    }
    const selectedIdsAsNumbers = ids.map((id) => id); // or Number(id)

    await prisma.paymentLog.updateMany({
      where: {
        id: { in: selectedIdsAsNumbers },
      },
      data: {
        amount: paymentData.amount,
        paymentType: paymentData.paymentType,
        status: paymentData.status,
        dueDate: new Date(paymentData.dueDate),
        description: paymentData.description || null,
        paymentMethod: paymentData.paymentMethod || null,
        receiptNumber: paymentData.receiptNumber || null,
        classId,
        gradeId,
      },
    });
    const updatedPayments = await prisma.paymentLog.findMany({
      where: {
        id: { in: selectedIdsAsNumbers },
      },
      include: {
        student: {
          select: {
            name: true,
            namalengkap: true,
            class: {
              select: {
                name: true,
              },
            },
            student_details: { select: { nisn: true } },
          },
        },
      },
    });
    return {
      success: true,
      error: false,
      message: "Tagihan berhasil diperbarui.",
      data: updatedPayments,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: true,
      message: "Gagal memperbarui tagihan.",
    };
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

export const deletePaymentLogs = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return { success: false, error: true, message: "No student IDs provided." };
  }

  try {
    for (const id of ids) {
      const idAsNumber = parseInt(id);
      try {
        await prisma.paymentLog.delete({ where: { id: idAsNumber } });
      } catch (innerError) {
        console.error(`❌ Failed to delete Payment Log ID ${id}:`, innerError);
        // Optionally continue deleting others instead of failing all
      }
    }

    return {
      success: true,
      error: false,
      message: `Deleted ${ids.length} Payment(s) successfully.`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    return { success: false, error: true, message };
  }
};
