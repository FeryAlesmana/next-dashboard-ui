"use server";
import { v2 as cloudinary } from "cloudinary";
import ExcelJS from "exceljs";

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
  ImportTeacherSchema,
  ImportStudentSchema,
  UserSchema,
  EskulSchema,
} from "./formValidationSchema";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import extractCloudinaryPublicId, {
  decryptPassword,
  getCurrentUser,
  normalizeAgama,
  normalizeBirthday,
  normalizeRow,
  normalizeSex,
} from "./utils";
import { Agama, Degree, parents, Prisma } from "@prisma/client";
import { encryptPassword } from "./utils";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import { error } from "console";
import { disconnect } from "process";

export type CurrentState = {
  success: boolean;
  error: boolean;
  message?: string;
  id?: string;
  field?: string;
  code?: string;
  failed?: string[];
  deleted?: string[];
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
    const { supervisorId, ...rest } = data;
    const createdClass = await prisma.class.create({
      data: {
        ...rest,
        supervisorId: supervisorId && supervisorId !== "" ? supervisorId : null, // ✅ normalize
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
    const { supervisorId, ...rest } = data;

    const updatedClass = await prisma.class.update({
      where: {
        id: data.id,
      },
      data: {
        ...rest,
        supervisorId: supervisorId && supervisorId !== "" ? supervisorId : null, // ✅ normalize
      },
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
    let user;
    try {
      user = await client.users.createUser({
        username: data.username,
        password: data.password,
        firstName: data.name,

        publicMetadata: { role: "teacher" },
      });
      if (user) {
        console.log("✅ User Sucessfully created:", user.id);
      } else {
        console.warn(
          "⚠️ Clerk returned no user info. User may already be created?"
        );
      }
    } catch (err: any) {
      console.error("❌ Clerk error:", err);

      const message = err?.errors?.[0]?.message || "Terjadi kesalahan";

      if (message.toLowerCase().includes("username")) {
        return { success: false, field: "username", message, error: true };
      }
      if (message.toLowerCase().includes("password")) {
        return { success: false, field: "password", message, error: true };
      }

      return { success: false, field: undefined, message, error: true };
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const createdTeacher = await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        password: encryptPassword(data.password!),
        name: data.name,
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

    return { success: true, error: false, data: createdTeacher, id: user.id };
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

export const importTeachers = async (
  currentState: CurrentState,
  data: ImportTeacherSchema
) => {
  const file = data.file as File;
  if (!file) {
    return { success: false, error: true, message: "No file uploaded" };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer); // directly from ArrayBuffer
  const workbook = new ExcelJS.Workbook();

  // Create a single-chunk readable stream from the buffer
  const stream = Readable.from([buffer]);

  // Use the stream-based reader (avoids the Buffer typing issue)
  await workbook.xlsx.read(stream);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return { success: false, error: true, message: "Workbook has no sheets" };
  }

  // Read headers from the first row
  const headers: string[] = [];
  worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = (cell.value ?? "").toString().trim();
  });

  const teachers: any[] = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const rawRow: Record<string, any> = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber - 1] ?? `col${colNumber}`;
      rawRow[key] = cell.value ?? "";
    });

    const normRow = normalizeRow(rawRow);
    if (!normRow.name || !normRow.phone || !normRow.address) {
      throw new Error(
        "Tolong pastikan file anda memiliki kolom wajib! (Nama, Alamat, No. Telepon)"
      );
    }

    teachers.push({
      id: randomUUID(),
      username: normRow.username || normRow.name,
      password: encryptPassword(normRow.password || normRow.email), // default password
      name: normRow.name,
      email: normRow.email || null,
      phone: normRow.phone.toString(),
      address: normRow.address,
      rt: normRow.rt?.toString() || "-",
      rw: normRow.rw?.toString() || "-",
      kelurahan: normRow.kelurahan || "-",
      kecamatan: normRow.kecamatan || "-",
      kota: normRow.kota || "-",
      religion: normalizeAgama(normRow.religion),
      sex: normalizeSex(normRow.sex),
      birthday: new Date(normalizeBirthday(normRow.birthday)),
    });
  });
  try {
    await prisma.teacher.createMany({
      data: teachers,

      skipDuplicates: true, // skip if unique constraints fail
    });
    const importedTeachers = await prisma.teacher.findMany({
      where: {
        email: { in: teachers.map((t) => t.email).filter(Boolean) },
      },
      include: {
        subjects: { select: { id: true, name: true } },
        classes: true,
        lessons: true,
      },
    });
    return { success: true, error: false, data: importedTeachers };
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
    if (data.withUser) {
      try {
        user = await client.users.updateUser(data.id, {
          username: data.username,
          ...(data.password !== "" && {
            password: data.password,
          }),
          firstName: data.name,
        });
        if (user) {
          console.log("✅ User Sucessfully Updated:", user.id);
        }
      } catch (error) {
        console.warn(
          "⚠️ Clerk returned no user info. Attempting to create user..."
        );
        return {
          success: false,
          error: true,
          code: "USER_NOT_FOUND",
          message:
            "Akun ini belum diaktifkan di sistem Clerk. Aktifkan akun ini sekarang?",
          field: undefined,
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        id: user?.id ?? data.id,
        username: data.username,
        ...(data.password !== "" && {
          password: encryptPassword(data.password!),
        }),
        name: data.name,

        email: data.email || null,
        phone: data.phone,
        address: data.address,
        img: data.img ?? null, // <-- Always set explicitly
        sex: data.sex,
        birthday: new Date(data.birthday),
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
    const updatedTeacher = await prisma.teacher.findUnique({
      where: { id: user?.id || data.id },
      include: {
        subjects: { select: { id: true, name: true } },
        classes: true,
        lessons: true,
      },
    });
    if (updatedTeacher?.password) {
      updatedTeacher.password = decryptPassword(updatedTeacher.password);
    }
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
    let user;
    try {
      user = await client.users.createUser({
        username: data.username,
        password: data.password,
        firstName: data.name,

        publicMetadata: { role: "student" },
      });
      if (user) {
        console.log("✅ User Sucessfully created:", user.id);
      } else {
        console.warn(
          "⚠️ Clerk returned no user info. User may already be created?"
        );
      }
    } catch (err: any) {
      console.error("❌ Clerk error:", err);

      const message = err?.errors?.[0]?.message || "Terjadi kesalahan";

      if (message.toLowerCase().includes("username")) {
        return { success: false, field: "username", message, error: true };
      }
      if (message.toLowerCase().includes("password")) {
        return { success: false, field: "password", message, error: true };
      }

      return { success: false, field: undefined, message, error: true };
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const createdStudent = await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        password: encryptPassword(data.password),
        name: data.name,

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

export const importStudents = async (
  currentState: CurrentState,
  data: ImportStudentSchema
) => {
  const file = data.file as File;
  if (!file) {
    return { success: false, error: true, message: "No file uploaded" };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer); // directly from ArrayBuffer
  const workbook = new ExcelJS.Workbook();

  // Create a single-chunk readable stream from the buffer
  const stream = Readable.from([buffer]);

  // Use the stream-based reader (avoids the Buffer typing issue)
  await workbook.xlsx.read(stream);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return { success: false, error: true, message: "Workbook has no sheets" };
  }

  // Read headers from the first row
  const headers: string[] = [];
  worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = (cell.value ?? "").toString().trim();
  });

  const students: any[] = [];
  const studentDetails: any[] = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const rawRow: Record<string, any> = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber - 1] ?? `col${colNumber}`;
      rawRow[key] = cell.value ?? "";
    });

    const normRow = normalizeRow(rawRow);
    if (!normRow.name || !normRow.phone || !normRow.address) {
      throw new Error(
        "Tolong pastikan file anda memiliki kolom wajib! (Nama, Alamat, No. Telepon)"
      );
    }
    const studentId = randomUUID();
    students.push({
      id: studentId,
      username: normRow.username || normRow.name,
      password: encryptPassword(normRow.password || normRow.email), // default password
      name: normRow.name,
      email: normRow.email || null,
      phone: normRow.phone.toString(),
      address: normRow.address,
      rt: normRow.rt?.toString() || "-",
      rw: normRow.rw?.toString() || "-",
      kelurahan: normRow.kelurahan || "-",
      kecamatan: normRow.kecamatan || "-",
      kota: normRow.kota || "-",
      religion: normalizeAgama(normRow.religion),
      sex: normalizeSex(normRow.sex), // must match enum UserSex
      birthday: new Date(normalizeBirthday(normRow.birthday)),
    });
    studentDetails.push({
      studentId: studentId,
      nisn: normRow.nisn?.toString() || "-",
    });
  });

  try {
    await prisma.student.createMany({
      data: students,

      skipDuplicates: true, // skip if unique constraints fail
    });

    await prisma.student_details.createMany({
      data: studentDetails,
      skipDuplicates: true,
    });
    const importedStudents = await prisma.student.findMany({
      where: {
        email: { in: students.map((t) => t.email).filter(Boolean) },
      },
      include: {
        class: true,
        student_details: true,
        grade: true,
      },
    });
    return { success: true, error: false, data: importedStudents };
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
  data: UpdatestudentSchema
) => {
  try {
    if (!data.id) {
      console.log(data.id + "Data.id");

      return { success: false, error: true, message: "Missing student ID" };
    }

    let user;
    if (data.withUser) {
      let clerkUserId = data.id;
      try {
        user = await client.users.updateUser(data.id, {
          username: data.username,
          ...(data.password !== "" && {
            password: data.password,
          }),
          firstName: data.name,
        });
        if (user) {
          console.log("✅ User Sucessfully Updated:", user.id);
          clerkUserId = user.id;
        }
      } catch (error) {
        console.warn(
          "⚠️ Clerk returned no user info. Attempting to create user..."
        );
        return {
          success: false,
          error: true,
          code: "USER_NOT_FOUND",
          message:
            "Akun ini belum diaktifkan di sistem Clerk. Aktifkan akun ini sekarang?",
          field: undefined,
        };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        id: user?.id ?? data.id,
        username: data.username,
        ...(data.password !== "" && {
          password: encryptPassword(data.password!),
        }),
        name: data.name,

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
        birthday: new Date(data.birthday),
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

    const updatedStudent = await prisma.student.findUnique({
      where: { id: user?.id || data.id },
    });
    if (updatedStudent?.password) {
      updatedStudent.password = decryptPassword(updatedStudent.password);
    }

    return { success: true, error: false, data: updatedStudent };
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
        date: data.date,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        lessonId: data.lessonId,
        exType: data.exType,
      },
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true } },
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
        date: data.date,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
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
            teacher: { select: { name: true } },
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
            teacher: { select: { name: true, id: true } },
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
            teacher: { select: { name: true, id: true } },
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
            teacher: { select: { name: true, id: true } },
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
            teacher: { select: { name: true, id: true } },
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
    let user;
    try {
      user = await client.users.createUser({
        username: data.username,
        password: data.password,
        firstName: data.name,
        publicMetadata: { role: "parent" },
      });
      if (user) {
        console.log("✅ User Sucessfully created:", user.id);
      } else {
        console.warn(
          "⚠️ Clerk returned no user info. User may already be created?"
        );
      }
    } catch (err: any) {
      console.error("❌ Clerk error:", err);

      const message = err?.errors?.[0]?.message || "Terjadi kesalahan";

      if (message.toLowerCase().includes("username")) {
        return { success: false, field: "username", message, error: true };
      }
      if (message.toLowerCase().includes("password")) {
        return { success: false, field: "password", message, error: true };
      }

      return { success: false, field: undefined, message, error: true };
    }

    let studentField;
    if (data.students!) {
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
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const createdParent = await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        password: encryptPassword(data.password),
        name: data.name,

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
    return {
      success: true,
      error: false,
      id: user.id,
      data: createdParent,
      field: undefined,
    };
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
    if (data.withUser) {
      let clerkUserId = data.id;
      try {
        user = await client.users.updateUser(data.id, {
          username: data.username,
          ...(data.password !== "" && {
            password: data.password,
          }),
          firstName: data.name,
        });
        if (user) {
          console.log("✅ User Sucessfully Updated:", user.id);
          clerkUserId = user.id;
        }
      } catch (error) {
        console.warn(
          "⚠️ Clerk returned no user info. Attempting to create user..."
        );
        return {
          success: false,
          error: true,
          code: "USER_NOT_FOUND",
          message:
            "Akun ini belum diaktifkan di sistem Clerk. Aktifkan akun ini sekarang?",
          field: undefined,
        };
      }
    }
    let studentField;
    if (data.students!) {
      switch (data.waliMurid) {
        case "AYAH":
          studentField = {
            students: {
              set: data.students.map((studentId) => ({ id: studentId })),
            },
            secondaryStudents: { set: [] },
            guardianStudents: { set: [] },
          };
          break;

        case "IBU":
          studentField = {
            secondaryStudents: {
              set: data.students.map((studentId) => ({ id: studentId })),
            },
            students: { set: [] },
            guardianStudents: { set: [] },
          };
          break;

        case "WALI":
          studentField = {
            guardianStudents: {
              set: data.students.map((studentId) => ({ id: studentId })),
            },
            students: { set: [] },
            secondaryStudents: { set: [] },
          };
          break;

        default:
          studentField = {};
          break;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        id: user?.id ?? data.id,
        username: data.username,
        ...(data.password !== "" && {
          password: encryptPassword(data.password!),
        }),
        name: data.name,
        job: data.job,
        income: data.income,
        degree: data.degree,
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
    if (updatedParent?.password) {
      updatedParent.password = decryptPassword(updatedParent.password);
    }
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
      return { success: true, error: true };
    }
    // revalidatePath("/list/parents");
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
    const createdLesson = await prisma.lesson.create({
      data: {
        name: data.name,
        startTime: data.startTime,
        day: data.day,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true, gradeId: true } },
        teacher: { select: { name: true } },
      },
    });
    return { success: true, error: false, data: createdLesson };
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

    const updatedLesson = await prisma.lesson.findUnique({
      where: { id: data.id },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true, gradeId: true } },
        teacher: { select: { name: true } },
      },
    });
    return { success: true, error: false, data: updatedLesson };
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
        student: { select: { name: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true, gradeId: true } },
                teacher: { select: { name: true } },
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
                teacher: { select: { name: true } },
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
    const safeExamId = data.selectedType === "Ujian" ? data.examId : null;
    const safeAssignmentId =
      data.selectedType === "Tugas" ? data.assignmentId : null;
    if (data.selectedType === "Ujian") {
      // Step 1: clear assignmentId
      await prisma.result.update({
        where: { id: data.id },
        data: { assignmentId: null },
      });

      // Step 2: update with examId
      await prisma.result.update({
        where: { id: data.id },
        data: {
          score: data.score,
          studentId: data.studentId,
          examId: safeExamId ? safeExamId : null,
          resultType: data.resultType,
        },
      });
    } else if (data.selectedType === "Tugas") {
      // Step 1: clear examId
      await prisma.result.update({
        where: { id: data.id },
        data: { examId: null },
      });

      // Step 2: update with assignmentId
      await prisma.result.update({
        where: { id: data.id },
        data: {
          score: data.score,
          studentId: data.studentId,
          assignmentId: safeAssignmentId ? safeAssignmentId : null,
          resultType: data.resultType,
        },
      });
    } else {
      // Just update score/student/type
      await prisma.result.update({
        where: { id: data.id },
        data: {
          score: data.score,
          examId: safeExamId ? safeExamId : null,
          assignmentId: safeAssignmentId ? safeAssignmentId : null,
        },
      });
    }
    const updatedResult = await prisma.result.findUnique({
      where: { id: data.id },
      include: {
        student: { select: { name: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true, gradeId: true } },
                teacher: { select: { name: true } },
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
                teacher: { select: { name: true } },
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
      ...(score !== "" && {
        score: score,
      }),
      ...(resultType !== "" && {
        resultType: resultType,
      }),
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
        student: { select: { name: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true, gradeId: true } },
                teacher: { select: { name: true } },
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
                teacher: { select: { name: true } },
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
        noWa: data.noWhatsapp,
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
        withUser: false,
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
          withUser: false,
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
          withUser: false,
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
          withUser: false,
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
        where: { id: parseInt(recipientId) },
        include: { grade: true },
      });
      classId = classData?.id ?? null;
      gradeId = classData?.gradeId ?? null;
    } else if (recipientType === "grade") {
      gradeId = parseInt(recipientId);
    } else if (recipientType === "student") {
      const student = await prisma.student.findUnique({
        where: { id: recipientId as string },
        select: { classId: true, gradeId: true, id: true },
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
        studentId: recipientId,
        // store paidAt if provided
        paidAt: paymentData.paidAt ? new Date(paymentData.paidAt) : null,

        // handle installments (amountPaid lives here)
        paymentInstallments: paymentData.amountPaid
          ? {
              create: {
                amount: paymentData.amountPaid,
                paidAt: paymentData.paidAt
                  ? new Date(paymentData.paidAt)
                  : null,
              },
            }
          : undefined,
      },
      include: {
        student: {
          select: {
            name: true,

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
    const { ids, ...paymentData } = data;

    let classId: number | null = null;
    let gradeId: number | null = null;

    const selectedIdsAsNumbers = ids.map((id) => id); // or Number(id)

    // Build updateData dynamically, only include non-empty values
    const updateData: any = {
      ...(paymentData.amount !== undefined && { amount: paymentData.amount }),
      ...(paymentData.paymentType !== "" && {
        paymentType: paymentData.paymentType,
      }),
      ...(paymentData.status !== "" && { status: paymentData.status }),
      ...(paymentData.dueDate && { dueDate: new Date(paymentData.dueDate) }),
      ...(paymentData.description !== "" && {
        description: paymentData.description,
      }),
      ...(paymentData.paymentMethod !== "" && {
        paymentMethod: paymentData.paymentMethod,
      }),
      ...(paymentData.receiptNumber !== "" && {
        receiptNumber: paymentData.receiptNumber,
      }),
      ...(classId !== null && { classId }),
      ...(gradeId !== null && { gradeId }),
      ...(paymentData.paidAt !== null && {
        paidAt: new Date(paymentData.paidAt!),
      }),
    };

    await prisma.paymentLog.updateMany({
      where: { id: { in: selectedIdsAsNumbers } },
      data: updateData,
    });
    if (paymentData.amountPaid) {
      await Promise.all(
        selectedIdsAsNumbers.map((id) =>
          prisma.paymentInstallment.create({
            data: {
              amount: paymentData.amountPaid!,
              paidAt: paymentData.paidAt ? new Date(paymentData.paidAt) : null,
              paymentLogId: id, // FK relation
            },
          })
        )
      );
    }
    const updatedPayments = await prisma.paymentLog.findMany({
      where: {
        id: { in: selectedIdsAsNumbers },
      },
      include: {
        student: {
          select: {
            name: true,

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

export const createUserDB = async (
  currentState: CurrentState,
  data: UserSchema
) => {
  try {
    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      publicMetadata: { role: data.role },
    });
    // 2. Update local DB record (student, teacher, or parent)
    let updatedUser = null;

    if (data.role === "student") {
      updatedUser = await prisma.student.update({
        where: { id: String(data.userId) },
        data: {
          id: user.id,
          username: data.username,
          email: data.email,
          password: encryptPassword(data.password!), // keep encrypted
        },
      });
    } else if (data.role === "teacher") {
      updatedUser = await prisma.teacher.update({
        where: { id: String(data.userId) },
        data: {
          id: user.id,
          username: data.username,
          email: data.email,
          password: encryptPassword(data.password!),
        },
      });
    } else if (data.role === "parent") {
      updatedUser = await prisma.parent.update({
        where: { id: String(data.userId) },
        data: {
          id: user.id,
          username: data.username,
          email: data.email,
          password: encryptPassword(data.password!),
        },
      });
    }

    return { success: true, error: false, id: user.id, data: updatedUser };
  } catch (error: any) {
    console.error("Create student failed:", error);
    if (error?.errors) {
      console.error("Clerk errors:", JSON.stringify(error.errors, null, 2));
    }
    let message = "Unknown error";
    // Handle Clerk API errors properly
    let field: string | undefined;
    if (
      error?.errors &&
      Array.isArray(error.errors) &&
      error.errors.length > 0
    ) {
      message = error.errors[0].message;

      if (message.toLowerCase().includes("username")) {
        field = "username";
      } else if (message.toLowerCase().includes("password")) {
        field = "password";
      }
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    return { success: false, error: true, message, field: field };
  }
};

// 🔹 Update existing user
export const updateUserDB = async (
  currentState: CurrentState,
  data: UserSchema
) => {
  try {
    // 1. Update Clerk user
    const user = await client.users.updateUser(data.id!, {
      username: data.username,
      password: data.password,
      publicMetadata: { role: data.role },
    });

    // 2. Update local DB
    let updatedUser = null;
    const updateData = {
      id: user.id,
      username: data.username,
      email: data.email,
      password: encryptPassword(data.password!),
    };

    if (data.role === "student") {
      updatedUser = await prisma.student.update({
        where: { id: String(data.userId) },
        data: updateData,
      });
    } else if (data.role === "teacher") {
      updatedUser = await prisma.teacher.update({
        where: { id: String(data.userId) },
        data: updateData,
      });
    } else if (data.role === "parent") {
      updatedUser = await prisma.parent.update({
        where: { id: String(data.userId) },
        data: updateData,
      });
    }

    return { success: true, error: false, id: user.id, data: updatedUser };
  } catch (error: any) {
    console.error("Update user failed:", error);
    let message = "Unknown error";
    let field: string | undefined;
    if (error?.errors?.[0]?.message) {
      message = error.errors[0].message;
      if (message.toLowerCase().includes("username")) {
        field = "username";
      } else if (message.toLowerCase().includes("password")) {
        field = "password";
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    return { success: false, error: true, message, field: field };
  }
};

// 🔹 Delete user
export const deleteUser = async (
  currentState: CurrentState,
  formData: FormData
) => {
  const id = formData.get("id") as string;
  try {
    // 1. Delete Clerk user
    await client.users.deleteUser(id!);

    // 2. Optionally delete or nullify local DB record
    // If you want to keep the record but clear auth fields:

    return { success: true, error: false };
  } catch (error: any) {
    console.error("Delete user failed:", error);
    let message = "Unknown error";

    if (error?.errors?.[0]?.message) {
      message = error.errors[0].message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return { success: false, error: true, message };
  }
};

export const activateManyStudents = async (
  ids: string[],
  form: boolean = false
) => {
  const created: string[] = [];
  const skipped: string[] = [];
  const failed: { username: string; field?: string; message: string }[] = [];

  let createdStudentId: string | undefined = undefined;
  for (const id of ids) {
    try {
      const student = await prisma.student.findUnique({ where: { id } });
      if (!student) continue;

      // 🔍 Check Clerk by externalId (using Prisma ID as externalId)
      const existing = await client.users.getUserList({ externalId: [id] });

      if (existing.totalCount > 0) {
        skipped.push(student.username);
        continue;
      }
      try {
        const user = await client.users.createUser({
          externalId: id, // 💡 this is how you map to Prisma
          username: student.username,
          password: student.password,
          firstName: student.name,
          publicMetadata: { role: "student" },
        });

        if (user) {
          console.log("User Berhasil di buat");
          await prisma.student.update({
            where: { id },
            data: { id: user.id },
          });
          created.push(student.username);
          if (form && !createdStudentId) {
            // ✅ only set once (for single form mode)
            createdStudentId = user.id;
          }
        }
      } catch (err: any) {
        console.error("❌ Clerk error:", err);

        const message = err?.errors?.[0]?.message || "Terjadi kesalahan";
        // Detect which field caused the problem
        let field: string | undefined;
        if (message.toLowerCase().includes("username")) field = "username";
        else if (message.toLowerCase().includes("password")) field = "password";

        console.error(`❌ Clerk error for ${student.username}:`, message);
        failed.push({
          username: student.username,
          field,
          message,
        });
        continue; // ✅ Don’t stop the loop
      }
    } catch (err) {
      console.error("❌ Failed:", err);
      failed.push({
        username: "(unknown)",
        message: `Id Murid yang Gagal: ${id}`,
      });
    }
  }

  return {
    success: failed.length === 0,
    created,
    skipped,
    failed,
    id: createdStudentId,
    message: `✅ ${created.length} Di Aktifkan, ⚠️ ${skipped.length} Di Lewati, ❌ ${failed.length} Gagal.`,
  };
};
export const activateManyTeachers = async (
  ids: string[],
  form: boolean = false
) => {
  const created: string[] = [];
  const skipped: string[] = [];
  const failed: { username: string; field?: string; message: string }[] = [];
  let createdTeacherId: string | undefined = undefined;
  for (const id of ids) {
    try {
      const teacher = await prisma.teacher.findUnique({ where: { id } });
      if (!teacher) continue;

      // 🔍 Check Clerk by externalId (using Prisma ID as externalId)
      const existing = await client.users.getUserList({ externalId: [id] });

      if (existing.totalCount > 0) {
        skipped.push(teacher.username);
        continue;
      }
      try {
        const user = await client.users.createUser({
          externalId: id, // 💡 this is how you map to Prisma
          username: teacher.username,
          password: teacher.password,
          firstName: teacher.name,
          publicMetadata: { role: "teacher" },
        });

        if (user) {
          await prisma.teacher.update({
            where: { id },
            data: { id: user.id },
          });
          created.push(teacher.username);
          if (form && !createdTeacherId) {
            // ✅ only set once (for single form mode)
            createdTeacherId = user.id;
          }
        }
      } catch (err: any) {
        console.error("❌ Clerk error:", err);

        const message = err?.errors?.[0]?.message || "Terjadi kesalahan";
        // Detect which field caused the problem
        let field: string | undefined;
        if (message.toLowerCase().includes("username")) field = "username";
        else if (message.toLowerCase().includes("password")) field = "password";

        console.error(`❌ Clerk error for ${teacher.username}:`, message);
        failed.push({
          username: teacher.username,
          field,
          message,
        });
        continue; // ✅ Don’t stop the loop
      }
    } catch (err) {
      console.error("❌ Gagal:", err);
      failed.push({
        username: "(unknown)",
        message: `Id Guru yang Gagal: ${id}`,
      });
    }
  }

  return {
    success: failed.length === 0,
    created,
    skipped,
    failed,
    id: createdTeacherId,
    message: `✅ ${created.length} Di Aktifkan, ⚠️ ${skipped.length} Di Lewati, ❌ ${failed.length} Gagal.`,
  };
};
export const activateManyParents = async (
  ids: string[],
  form: boolean = false
) => {
  const created: string[] = [];
  const skipped: string[] = [];
  const failed: { username: string; field?: string; message: string }[] = [];
  let createdParentId: string | undefined = undefined;
  for (const id of ids) {
    try {
      const parent = await prisma.parent.findUnique({ where: { id } });
      if (!parent) continue;

      // 🔍 Check Clerk by externalId (using Prisma ID as externalId)
      const existing = await client.users.getUserList({ externalId: [id] });

      if (existing.totalCount > 0) {
        skipped.push(parent.username);
        continue;
      }
      try {
        const user = await client.users.createUser({
          externalId: id, // 💡 this is how you map to Prisma
          username: parent.username,
          password: parent.password,
          firstName: parent.name,
          publicMetadata: { role: "parent" },
        });
        if (user) {
          console.log("User Berhasil di buat");

          await prisma.parent.update({
            where: { id },
            data: { id: user.id },
          });
          created.push(parent.username);
          if (form && !createdParentId) {
            // ✅ only set once (for single form mode)
            createdParentId = user.id;
          }
        }
      } catch (err: any) {
        console.error("❌ Clerk error:", err);

        const message = err?.errors?.[0]?.message || "Terjadi kesalahan";
        // Detect which field caused the problem
        let field: string | undefined;
        if (message.toLowerCase().includes("username")) field = "username";
        else if (message.toLowerCase().includes("password")) field = "password";

        console.error(`❌ Clerk error for ${parent.username}:`, message);
        failed.push({
          username: parent.username,
          field,
          message,
        });
        continue; // ✅ Don’t stop the loop
      }
    } catch (err) {
      console.error("❌ Failed:", err);
      failed.push({
        username: "(unknown)",
        message: `Id Wali Murid yang Gagal: ${id}`,
      });
    }
  }

  return {
    success: failed.length === 0,
    created,
    skipped,
    failed,
    id: createdParentId,
    message: `✅ ${created.length} Di Aktifkan, ⚠️ ${skipped.length} Di Lewati, ❌ ${failed.length} Gagal.`,
  };
};

export const deleteManyUsers = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return { success: false, error: true, message: "No student IDs provided." };
  }
  try {
    const deleted: string[] = [];
    const failed: string[] = [];

    for (const id of ids) {
      try {
        await client.users.deleteUser(id);
        deleted.push(id);
      } catch (err) {
        console.error("Failed to delete user", id, err);
        failed.push(id);
      }
    }

    return {
      success: true,
      message: `✅ ${deleted.length} deleted, ❌ ${failed.length} failed.`,
      deleted,
      failed,
      error: false,
    };
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      error: true,
      message: err.message || "Unknown error",
    };
  }
};
