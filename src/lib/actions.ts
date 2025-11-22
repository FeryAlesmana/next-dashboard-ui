"use server";
import { v2 as cloudinary } from "cloudinary";
import ExcelJS from "exceljs";
import os from "os";
import path from "path";

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
  PPDBSettingSchema,
  ImportPaymentsSchema,
  ExportPaymentsSchema,
  CreatestaffSchema,
  UpdatestaffSchema,
} from "./formValidationSchema";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import extractCloudinaryPublicId, {
  decryptPassword,
  getCurrentUser,
  getPeriodRange,
  mapPaymentType,
  normalizeAgama,
  normalizeBirthday,
  normalizePaymentRow,
  normalizeRow,
  normalizeSex,
} from "./utils";
import { Agama, Degree, parents, PaymentStatus, Prisma } from "@prisma/client";
import { encryptPassword } from "./utils";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import { error } from "console";
import { disconnect } from "process";
import { Decimal } from "@prisma/client/runtime/library";
import { logPaymentChange } from "./paymentLogChange";

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
  skipped?: any;
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
        ...(data.img && { img: data.img }),
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
  data: CreatestudentSchema,
  PPDB: boolean = false
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
    let clerkUser: any = null;

    // ---------------------------------------------
    // 1️⃣ CHECK PPDB FLAG
    // ---------------------------------------------
    if (PPDB) {
      console.log("🔍 PPDB mode: finding existing Clerk user...");

      clerkUser = await client.users.getUser(data.sdId);

      if (!clerkUser) {
        return {
          success: false,
          field: "sdId",
          message: "Akun PPDB tidak ditemukan di Clerk.",
          error: true,
        };
      }

      console.log("✅ Existing Clerk user found:", clerkUser.id);
    } else {
      // ---------------------------------------------
      // 2️⃣ NORMAL MODE (create new user)
      // ---------------------------------------------
      try {
        clerkUser = await client.users.createUser({
          username: data.username,
          password: data.password,
          firstName: data.name,
          publicMetadata: { role: "student" },
        });

        console.log("✅ Clerk user created:", clerkUser.id);
      } catch (err: any) {
        console.error("❌ Clerk error:", err);

        const message = err?.errors?.[0]?.message || "Terjadi kesalahan";

        if (message.toLowerCase().includes("username")) {
          return { success: false, field: "username", message, error: true };
        }
        if (message.toLowerCase().includes("password")) {
          return { success: false, field: "password", message, error: true };
        }

        return { success: false, message, error: true };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    let gradeId: number | null = null;
    if (data.classId) {
      const cls = await prisma.class.findUnique({
        where: { id: data.classId },
        select: { gradeId: true },
      });
      if (cls?.gradeId) {
        gradeId = cls.gradeId;
      }
    }
    const createdStudent = await prisma.student.create({
      data: {
        id: clerkUser.id,
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
        gradeId,
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
    return {
      success: true,
      error: false,
      id: clerkUser.id,
      data: createdStudent,
    };
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
    await prisma.$transaction(async (tx) => {
      // 1. Buat semua student dulu
      const createdStudents = await tx.student.createMany({
        data: students,
        skipDuplicates: false, // Kita tangani sendiri
      });

      // 2. Ambil ID yang benar-benar berhasil dibuat
      const createdStudentIds = students.map((s) => s.id);

      // 3. Filter studentDetails hanya untuk ID yang pasti ada
      const validStudentDetails = studentDetails.filter((detail) =>
        createdStudentIds.includes(detail.studentId)
      );

      // 4. Buat student_details
      await tx.student_details.createMany({
        data: validStudentDetails,
        skipDuplicates: true, // aman karena ID sudah pasti ada
      });
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
    let gradeId: number | null = null;
    if (data.classId) {
      const cls = await prisma.class.findUnique({
        where: { id: data.classId },
        select: { gradeId: true },
      });
      if (cls?.gradeId) {
        gradeId = cls.gradeId;
      }
    }
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
        gradeId,
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
      /** ----------------------------------------------------
       * 1️⃣ Create Clerk user first (must be outside transaction)
       * ---------------------------------------------------- */
      let clerkUser;
      try {
        clerkUser = await client.users.createUser({
          username: data.name,
          password: data.nisn,
          firstName: data.name,
          publicMetadata: { role: "student" },
        });
      } catch (err: any) {
        const message = err?.errors?.[0]?.message || "Terjadi kesalahan";
        return { success: false, error: true, message };
      }

      const clerkId = clerkUser.id;

      /** ----------------------------------------------------
       * 2️⃣ Start Prisma Transaction
       * ---------------------------------------------------- */
      const result = await prisma.$transaction(async (tx) => {
        /** -------------------------
         * Create Student
         * ------------------------- */
        const student = await tx.student.create({
          data: {
            id: clerkId,
            username: clerkUser.username ?? data.name,
            password: encryptPassword(data.nisn),
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
            img: data.dokumenPasfoto ?? null,
            birthday: new Date(data.birthday),
            classId: data.classId ?? null,
          },
        });

        /** -------------------------
         * Create Student Details
         * ------------------------- */
        await tx.student_details.create({
          data: {
            studentId: student.id,
            asalSekolah: data.asalSekolah,
            birthPlace: data.birthPlace,
            noWa: data.noWhatsapp,
            nisn: data.nisn,
            npsn: data.npsn,
            no_ijz: data.no_ijz,
            nik: data.nik,
            kps: data.kps === "" ? null : data.kps,
            no_kps: data.no_kps ?? null,
            height: data.height,
            weight: data.weight,
            transportation: data.transportation,
            tempat_tinggal: data.tempat_tinggal,
            distance_from_home: data.distance_from_home,
            time_from_home: data.time_from_home,
            number_of_siblings: data.number_of_siblings,
            postcode: data.postcode,
            awards: data.awards ?? null,
            awards_lvl: data.awards_lvl ?? null,
            awards_date: data.awards_date ? new Date(data.awards_date) : null,
            scholarship: data.scholarship ?? null,
            scholarship_detail: data.scholarship_detail ?? null,
            dokumenIjazah: data.dokumenIjazah ?? null,
            dokumenAkte: data.dokumenAkte ?? null,
            dokumenPasfoto: data.dokumenPasfoto ?? null,
            dokumenKKKTP: data.dokumenKKKTP ?? null,
          },
        });

        /** Helper: build parent payload */
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
        const makeParent = (
          role: parents,
          name: string,
          sex: "MALE" | "FEMALE",
          income: number,
          degree?: string,
          kerja?: string,
          lahir?: string,
          phone?: string
        ) => ({
          username: `${data.nik}_${role}`,
          password: encryptPassword(`${data.nik}@${role}`),
          email: `${data.nik}_${role}@parent.local`,
          name,
          phone: phone ?? "",
          birthday: lahir ? new Date(lahir) : new Date(1970, 0, 1),
          job: kerja ?? "",
          income: income,
          degree: toDegree(degree),
          waliMurid: role,
          address: data.address,
          sex,
        });

        let parentId: string | null = null;
        let secondParentId: string | null = null;
        let guardianId: string | null = null;

        /** -------------------------
         * Create Parents (Ayah / Ibu / Wali)
         * ------------------------- */

        // Ayah
        if (data.namaAyah) {
          const parentData = makeParent(
            "AYAH",
            data.namaAyah,
            "MALE",
            typeof data.penghasilanAyah === "number" ? data.penghasilanAyah : 0,
            data.pendidikanAyah ?? "",
            data.pekerjaanAyah ?? "",
            data.tahunLahirAyah ?? "",
            data.telpAyah ?? ""
          );

          // 🔥 Create Clerk account
          let Father;
          try {
            Father = await client.users.createUser({
              username: parentData.username,
              password: parentData.password,
              firstName: parentData.name,
              publicMetadata: { role: "parent" },
            });
          } catch (err: any) {
            const message =
              err?.errors?.[0]?.message || "Gagal membuat akun wali.";
            return { success: false, error: true, message };
          }

          // 🔥 Create Parent in Prisma with Clerk ID
          const wali = await tx.parent.create({
            data: {
              id: Father.id,
              ...parentData,
              students: { connect: { id: student.id } },
            },
          });

          guardianId = wali.id;
        }

        // Ibu
        if (data.namaIbu) {
          const parentData = makeParent(
            "IBU",
            data.namaIbu,
            "FEMALE",
            typeof data.penghasilanIbu === "number" ? data.penghasilanIbu : 0,
            data.pendidikanIbu ?? "",
            data.pekerjaanIbu ?? "",
            data.tahunLahirIbu ?? "",
            data.telpIbu ?? ""
          );

          // 🔥 Create Clerk account
          let mother;
          try {
            mother = await client.users.createUser({
              username: parentData.username,
              password: parentData.password,
              firstName: parentData.name,
              publicMetadata: { role: "parent" },
            });
          } catch (err: any) {
            const message =
              err?.errors?.[0]?.message || "Gagal membuat akun ibu.";
            return { success: false, error: true, message };
          }

          // 🔥 Create Prisma Parent using Clerk ID
          const ibu = await tx.parent.create({
            data: {
              id: mother.id,
              ...parentData,
              secondaryStudents: { connect: { id: student.id } },
            },
          });

          secondParentId = ibu.id;
        }

        // Wali
        if (data.namaWali) {
          const parentData = makeParent(
            "WALI",
            data.namaWali,
            "MALE",
            typeof data.penghasilanWali === "number" ? data.penghasilanWali : 0,
            data.pendidikanWali ?? "",
            data.pekerjaanWali ?? "",
            data.tahunLahirWali ?? "",
            data.telpWali ?? ""
          );

          // 🔥 Create Clerk account
          let clerkUser;
          try {
            clerkUser = await client.users.createUser({
              username: parentData.username,
              password: parentData.password,
              firstName: parentData.name,
              publicMetadata: { role: "parent" },
            });
          } catch (err: any) {
            const message =
              err?.errors?.[0]?.message || "Gagal membuat akun wali.";
            return { success: false, error: true, message };
          }

          // 🔥 Create Parent in Prisma with Clerk ID
          const wali = await tx.parent.create({
            data: {
              id: clerkUser.id,
              ...parentData,
              guardianStudents: { connect: { id: student.id } },
            },
          });

          guardianId = wali.id;
        }

        /** -------------------------
         * Update student with parent references
         * ------------------------- */
        await tx.student.update({
          where: { id: student.id },
          data: {
            parentId,
            secondParentId,
            guardianId,
          },
        });

        /** -------------------------
         * Final: Mark PPDB row updated
         * ------------------------- */

        return { student };
      });
    }

    const updatedPpdb = await prisma.pPDB.findUnique({
      where: { id: data.id },
    });

    return {
      success: true,
      error: false,
      data: updatedPpdb,
      message: "PPDB Berhasil di update",
    };
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
        class: {
          select: {
            gradeId: true,
          },
        },
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
        gradeId: student.class?.gradeId || null,
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

    await Promise.all(
      createdPayments.map((payment) =>
        logPaymentChange({
          action: "CREATE",
          paymentLogId: payment.id,
          newValue: payment,
        })
      )
    );

    function safeDecimal(value: Decimal) {
      return value && typeof value === "object" && value.toNumber
        ? value.toNumber()
        : value;
    }
    function safePaymentLogArray(payments: any) {
      return payments.map((p: any) => ({
        ...p,
        amount: safeDecimal(p.amount),
      }));
    }
    const safePayments = safePaymentLogArray(createdPayments);
    return {
      success: true,
      error: false,
      message: "Tagihan berhasil dibuat.",
      data: safePayments,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Gagal membuat tagihan." };
  }
}

async function withSyncedGradeId(data: any) {
  if (data.classId) {
    const cls = await prisma.class.findUnique({
      where: { id: data.classId },
      select: { gradeId: true },
    });
    if (cls?.gradeId) data.gradeId = cls.gradeId;
  }
  return data;
}

export default withSyncedGradeId;

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
    // 1️⃣ Fetch old record safely
    const oldRecord = await prisma.paymentLog.findUnique({
      where: { id: data.id },
      include: { paymentInstallments: true },
    });

    if (!oldRecord) {
      return {
        success: false,
        error: true,
        message: "Tagihan tidak ditemukan.",
      };
    }

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
        select: {
          classId: true,
          id: true,
          class: {
            select: {
              gradeId: true,
            },
          },
        },
      });
      classId = student?.classId ?? null;
      gradeId = student?.class?.gradeId ?? null;
    }

    const existingInstallments = await prisma.paymentInstallment.findMany({
      where: { paymentLogId: data.id },
    });

    const totalPaid = existingInstallments.reduce((sum, i) => {
      const amountAsNumber =
        i.amount instanceof Decimal ? i.amount.toNumber() : Number(i.amount);

      return sum + amountAsNumber;
    }, 0);

    // remaining amount left to pay
    const remainingAmount = paymentData.amount - totalPaid;
    // Only keep new installments that are > 0 and not exceeding remainingAmount
    const newInstallments: { amount: number; paidAt?: string }[] = (
      paymentData.installments ?? []
    ).filter((i) => i.amount > 0);

    // If totalPaid already equals amount, ignore newInstallments
    const installmentAction =
      remainingAmount > 0 && newInstallments.length > 0
        ? {
            createMany: {
              data: newInstallments.map((i) => ({
                amount: i.amount,
                paidAt: i.paidAt ? new Date(i.paidAt) : null,
              })),
            },
          }
        : undefined;

    let finalPaidAt: Date | null = null;
    if (
      paymentData.status === PaymentStatus.PAID ||
      paymentData.status === PaymentStatus.PARTIALLY_PAID
    ) {
      // Use the last installment's paidAt if available
      const lastInstallment = newInstallments[newInstallments.length - 1];
      finalPaidAt =
        (lastInstallment?.paidAt && new Date(lastInstallment.paidAt)) ||
        (paymentData.paidAt ? new Date(paymentData.paidAt) : new Date());
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
        paidAt: finalPaidAt,
        // handle installments (amountPaid lives here)
        paymentInstallments: installmentAction,
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
        paymentInstallments: true,
      },
    });
    function safeDecimal(value: Decimal) {
      return value && typeof value === "object" && value.toNumber
        ? value.toNumber()
        : value;
    }

    const safePayment = {
      ...updatedPayment,
      amount: safeDecimal(updatedPayment.amount),
      paymentInstallments: updatedPayment.paymentInstallments.map((inst) => ({
        ...inst,
        amount: safeDecimal(inst.amount),
      })),
    };
    logPaymentChange({
      action: "UPDATE",
      paymentLogId: safePayment.id,
      oldValue: oldRecord,
      newValue: safePayment,
    });
    return {
      success: true,
      error: false,
      message: "Tagihan berhasil diperbarui.",
      data: safePayment,
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
  const idAsNumber = parseInt(id);
  try {
    const before = await prisma.paymentLog.findUnique({
      where: { id: idAsNumber },
    });
    await logPaymentChange({
      action: "DELETE",
      paymentLogId: before?.id,
      oldValue: before,
    });
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
        const before = await prisma.paymentLog.findUnique({
          where: { id: idAsNumber },
        });
        await logPaymentChange({
          action: "DELETE",
          paymentLogId: before?.id,
          oldValue: before,
        });
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

    switch (data.role) {
      case "student":
        updatedUser = await prisma.student.update({
          where: { id: String(data.userId) },
          data: {
            id: user.id,
            username: data.username,
            email: data.email,
            password: encryptPassword(data.password!), // keep encrypted
          },
        });
        break;
      case "teacher":
        updatedUser = await prisma.teacher.update({
          where: { id: String(data.userId) },
          data: {
            id: user.id,
            username: data.username,
            email: data.email,
            password: encryptPassword(data.password!),
          },
        });
        break;
      case "parent":
        updatedUser = await prisma.parent.update({
          where: { id: String(data.userId) },
          data: {
            id: user.id,
            username: data.username,
            email: data.email,
            password: encryptPassword(data.password!),
          },
        });
        break;
      case "staff":
        updatedUser = await prisma.staff.update({
          where: { id: String(data.userId) },
          data: {
            id: user.id,
            username: data.username,
            email: data.email,
            password: encryptPassword(data.password!),
          },
        });
        break;
      default:
        return {
          success: true,
          error: false,
          message: "User Tidak ditemukan di database!",
        };
    }
    const transformedRow = {
      id: user.id,

      img: updatedUser && "img" in updatedUser ? updatedUser.img : "",
      name: user.username || "-",
      dbName: updatedUser && "name" in updatedUser ? updatedUser.name : "-",
      email: updatedUser && "email" in updatedUser ? updatedUser.email : "—",
      role: user.publicMetadata?.role ?? "—",
      password: updatedUser?.password
        ? decryptPassword(updatedUser.password)
        : "",
    };

    return { success: true, error: false, id: user.id, data: transformedRow };
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

    switch (data.role) {
      case "student":
        updatedUser = await prisma.student.update({
          where: { id: String(data.userId) },
          data: updateData,
        });
        break;
      case "teacher":
        updatedUser = await prisma.teacher.update({
          where: { id: String(data.userId) },
          data: updateData,
        });
        break;
      case "parent":
        updatedUser = await prisma.parent.update({
          where: { id: String(data.userId) },
          data: updateData,
        });
        break;
      case "staff":
        updatedUser = await prisma.staff.update({
          where: { id: String(data.userId) },
          data: updateData,
        });
        break;
      default:
        return {
          success: true,
          error: false,
          message: "User Tidak ditemukan di database!",
        };
    }

    const transformedRow = {
      id: user.id,

      img: updatedUser && "img" in updatedUser ? updatedUser.img : "",
      name: user.username || "-",
      dbName: updatedUser && "name" in updatedUser ? updatedUser.name : "-",
      email: updatedUser && "email" in updatedUser ? updatedUser.email : "—",
      role: user.publicMetadata?.role ?? "—",
      password: updatedUser?.password
        ? decryptPassword(updatedUser.password)
        : "",
    };

    return { success: true, error: false, id: user.id, data: transformedRow };
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

export async function updatePPDBSetting(
  prevState: CurrentState,
  data: PPDBSettingSchema
): Promise<CurrentState> {
  try {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // If PPDB setting table has only ONE ROW:
    const existing = await prisma.pPDBSetting.findFirst();

    if (!existing) {
      // If not found, create a default row
      await prisma.pPDBSetting.create({
        data: {
          startDate,
          endDate,
          quota: data.quota,
        },
      });
    } else {
      // Update existing setting
      await prisma.pPDBSetting.update({
        where: { id: existing.id },
        data: {
          startDate,
          endDate,
          quota: data.quota,
        },
      });
    }

    return {
      success: true,
      error: false,
      message: "Pengaturan PPDB berhasil disimpan.",
    };
  } catch (err: any) {
    console.error("Update PPDB Setting Error:", err);

    return {
      success: false,
      error: true,
      message: err?.message || "Terjadi kesalahan.",
    };
  }
}

export const importPayments = async (
  currentState: CurrentState,
  data: ImportPaymentsSchema
) => {
  const file = data.file as File;
  if (!file) {
    return { success: false, error: true, message: "No file uploaded" };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const workbook = new ExcelJS.Workbook();
  const stream = Readable.from([buffer]);
  await workbook.xlsx.read(stream);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return { success: false, error: true, message: "Workbook has no sheets" };
  }

  // Read headers
  const headers: string[] = [];
  worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colIdx) => {
    headers[colIdx - 1] = (cell.value ?? "").toString().trim();
  });

  // Final data to insert
  const paymentLogs: any[] = [];
  const paymentInstallments: any[] = [];

  // Process rows
  const rowsToInsert: any[] = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    if (!row) continue;

    const rawRow: Record<string, any> = {};

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber - 1] ?? `col${colNumber}`;
      rawRow[key] = cell.value ?? "";
    });

    // Normalize based on your map
    const normRow = normalizePaymentRow(rawRow);

    // Validate required fields
    if (
      !normRow.nisn ||
      !normRow.amount ||
      !normRow.paymentType ||
      !normRow.dueDate
    ) {
      return {
        success: false,
        error: true,
        message: `Missing required fields on row ${rowNumber}. Required: NISN, Amount, Payment Type, Due Date.`,
      };
    }

    rowsToInsert.push(normRow);
  }

  try {
    const createdPayments: any[] = [];
    const skipped: { nisn: string | null; reason: string | "" }[] = [];

    await prisma.$transaction(async (tx) => {
      for (const row of rowsToInsert) {
        const nisnValue = row.nisn?.toString()?.trim();

        // ❗ Skip if NISN is missing
        if (!nisnValue) {
          skipped.push({
            nisn: row.nisn || null,
            reason: `NISN Tidak ditemukan: "${row.nisn}"`,
          });
          continue;
        }
        const mappedType = mapPaymentType(row.paymentType) ?? "OTHER";

        // Find student by NISN
        const student = await tx.student.findFirst({
          where: {
            student_details: {
              nisn: nisnValue,
            },
          },
          select: { id: true, classId: true, gradeId: true },
        });

        // ❗ Skip if not found
        if (!student) {
          skipped.push({
            nisn: nisnValue,
            reason: `Siswa Tidak ditemukan dengan NISN: "${row.nisn}"`,
          });
          continue;
        }

        // Create PaymentLog
        const log = await tx.paymentLog.create({
          data: {
            studentId: student.id,
            amount: Number(row.amount),
            paymentType: mappedType,
            dueDate: new Date(normalizeBirthday(row.dueDate)),
            description: row.description || null,
            paymentMethod: row.paymentMethod || null,
            status: "PENDING",
            receiptNumber: crypto.randomUUID(),
            classId: student.classId,
            gradeId: student.gradeId,
          },
        });

        createdPayments.push(log);

        // If Excel includes initial installment
        if (row.amountPaid && Number(row.amountPaid) > 0) {
          await tx.paymentInstallment.create({
            data: {
              paymentLogId: log.id,
              amount: Number(row.amountPaid),
              paidAt: row.paidAt ? new Date(row.paidAt) : new Date(),
            },
          });

          const totalPaid = Number(row.amountPaid);

          // Update status
          if (totalPaid >= Number(row.amount)) {
            await tx.paymentLog.update({
              where: { id: log.id },
              data: {
                status: "PAID",
                paidAt: row.paidAt ? new Date(row.paidAt) : new Date(),
              },
            });
          } else {
            await tx.paymentLog.update({
              where: { id: log.id },
              data: { status: "PARTIALLY_PAID" },
            });
          }
        }
      }
    });

    return {
      success: true,
      error: false,
      message: `${createdPayments.length} pembayaran berhasil diimport, ${skipped.length} data dilewati.`,
      skipped,
      data: createdPayments,
    };
  } catch (error: any) {
    return {
      success: false,
      error: true,
      message: error.message || "Unknown error",
    };
  }
};

export async function exportPaymentsToExcel(
  prev: any,
  data: ExportPaymentsSchema
) {
  try {
    const period = data.period;
    const startDate = data.startDate;
    const endDate = data.endDate;

    let start: Date;
    let end: Date;

    // If user chooses custom range
    if (period === "range" && startDate && endDate) {
      start = new Date(startDate + "T00:00:00");
      end = new Date(endDate + "T23:59:59");
    } else {
      // Default: week, month, year
      const range = getPeriodRange(period as any);
      start = range.start;
      end = range.end;
    }

    const payments = await prisma.paymentLog.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        student: {
          include: {
            student_details: true,
          },
        },
        paymentInstallments: true,
      },
    });
    function translatePeriod(p: string) {
      switch (p) {
        case "week":
          return "Minggu Ini";
        case "month":
          return "Bulan Ini";
        case "year":
          return "Tahun Ini";
        case "range":
          return "Rentang Tanggal";
        default:
          return p;
      }
    }

    // 🔹 Prepare workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "School System";
    workbook.created = new Date();

    const toRupiah = (num: number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 2,
      }).format(num);

    /*
     * =====================================================
     * 1️⃣ RINGKASAN
     * =====================================================
     */

    const summarySheet = workbook.addWorksheet("Ringkasan", {
      properties: { tabColor: { argb: "2E8B57" } },
    });

    const rows = payments.map((p) => {
      const paidAmount = p.paymentInstallments.reduce(
        (sum, inst) => sum + Number(inst.amount),
        0
      );

      let status = "PENDING";
      const full = Number(p.amount);

      if (paidAmount === 0) status = "PENDING";
      else if (paidAmount >= full) status = "PAID";
      else if (paidAmount > 0 && paidAmount < full) status = "PARTIALLY_PAID";

      const due = new Date(p.dueDate);
      if (paidAmount < full && due < new Date()) {
        status = "OVERDUE";
      }

      return {
        name: p.student.name,
        nisn: p.student.student_details?.nisn || "-",
        totalAmount: full,
        paidAmount,
        remaining: full - paidAmount,
        status,
      };
    });
    const totalTagihan = rows.reduce((s, r) => s + r.totalAmount, 0);
    const totalDibayar = rows.reduce((s, r) => s + r.paidAmount, 0);
    const totalBelum = rows.reduce((s, r) => s + r.remaining, 0);
    // HEADLINE
    summarySheet.mergeCells("A1:B1");
    const titleCell = summarySheet.getCell("A1");
    titleCell.value = "LAPORAN PEMBAYARAN";
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center" };

    // Add spacing row
    summarySheet.addRow([]);

    // PERIOD ROWS
    summarySheet.addRow(["Periode", translatePeriod(period)]);
    summarySheet.addRow([
      "Tanggal",
      `${start.toLocaleDateString("id-ID")} - ${end.toLocaleDateString(
        "id-ID"
      )}`,
    ]);

    summarySheet.addRow([]);

    // FINANCIAL SUMMARY
    const totals = [
      ["Total Tagihan", toRupiah(totalTagihan)],
      ["Total Sudah Dibayar", toRupiah(totalDibayar)],
      ["Total Belum Dibayar", toRupiah(totalBelum)],
    ];

    totals.forEach((row) => summarySheet.addRow(row));

    summarySheet.addRow([]);

    // STATUS SUMMARY HEADER
    const statusHeader = summarySheet.addRow(["RINGKASAN STATUS"]);
    statusHeader.font = { bold: true, color: { argb: "FF1A73E8" }, size: 12 };

    // STATUS COUNTS
    summarySheet.addRows([
      ["Lunas", rows.filter((r) => r.status === "PAID").length],
      ["Pending/Menunggu", rows.filter((r) => r.status === "PENDING").length],
      ["Terlambat", rows.filter((r) => r.status === "OVERDUE").length],
      [
        "Sebagian Dibayar",
        rows.filter((r) => r.status === "PARTIALLY_PAID").length,
      ],
    ]);

    // FORMAT SUMMARY TABLE
    summarySheet.getColumn(1).width = 40;
    summarySheet.getColumn(2).width = 30;

    // Style all data rows
    summarySheet.eachRow((row, rowNum) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        cell.font = { size: 12 };
        cell.alignment = { vertical: "middle" };
      });

      // Light background for alternating rows
      if (rowNum > 2 && rowNum % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF7F7F7" },
        };
      }
    });

    /*
     * =====================================================
     * 2️⃣ DATA PEMBAYARAN
     * =====================================================
     */

    const detailSheet = workbook.addWorksheet("Data Pembayaran");

    detailSheet.columns = [
      { header: "Nama Siswa", key: "name", width: 25 },
      { header: "NISN", key: "nisn", width: 15 },
      { header: "Nominal Tagihan", key: "tagihan", width: 20 },
      { header: "Jumlah Dibayar", key: "dibayar", width: 20 },
      { header: "Sisa", key: "sisa", width: 15 },
      { header: "Status", key: "status", width: 18 },
      { header: "Jatuh Tempo", key: "due", width: 18 },
      { header: "Tanggal dibuat", key: "created", width: 18 },
      { header: "Tanggal Dibayar", key: "paidAt", width: 18 },
    ];

    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).alignment = { horizontal: "center" };
    detailSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDDDDDD" },
    };

    function translateStatus(status: string) {
      switch (status) {
        case "PAID":
          return "Lunas";
        case "PENDING":
          return "Menunggu";
        case "PARTIALLY_PAID":
          return "Dibayar Sebagian";
        case "OVERDUE":
          return "Terlambat";
        default:
          return status;
      }
    }

    payments.forEach((p) => {
      const paid = p.paymentInstallments.reduce(
        (s, i) => s + Number(i.amount),
        0
      );

      const paidDates = p.paymentInstallments
        .filter((i) => i.paidAt) // remove null values
        .map((i) => new Date(i.paidAt as Date).getTime());

      const latestPaidAt =
        paidDates.length > 0
          ? new Date(Math.max(...paidDates)).toLocaleDateString("id-ID")
          : "-";

      let status = "PENDING";
      if (paid >= Number(p.amount)) status = "PAID";
      else if (paid > 0) status = "PARTIALLY_PAID";

      const due = new Date(p.dueDate);
      if (paid < Number(p.amount) && due < new Date()) {
        status = "OVERDUE";
      }

      const translatedStatus = translateStatus(status);

      const row = detailSheet.addRow({
        name: p.student.name,
        nisn: p.student.student_details?.nisn || "-",
        tagihan: toRupiah(Number(p.amount)),
        dibayar: toRupiah(paid),
        sisa: toRupiah(Number(p.amount) - paid),
        status: translatedStatus,
        due: new Date(p.dueDate).toLocaleDateString("id-ID"),
        created: new Date(p.createdAt).toLocaleDateString("id-ID"),
        paidAt: latestPaidAt, // ✅ NEW FIELD
      });

      // Apply color styling based on status
      let color = "FFFFFFFF"; // white
      if (status === "PAID") color = "FFCCFFCC"; // green
      if (status === "PENDING") color = "FFFFFFCC"; // yellow
      if (status === "OVERDUE") color = "FFFFCCCC"; // red
      if (status === "PARTIALLY_PAID") color = "FFE6CCFF"; // purple

      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: color },
        };
      });
      // =====================================
      // 2️⃣ EXPANDED INSTALLMENT DETAIL ROWS
      // =====================================
      if (p.paymentInstallments.length > 0) {
        p.paymentInstallments.forEach((inst, idx) => {
          const installmentRow = detailSheet.addRow({
            name: `→ Pembayaran ${idx + 1}`,
            nisn: "",
            tagihan: "",
            dibayar: toRupiah(Number(inst.amount)),
            sisa: "",
            status: "",
            due: "",
            created: "",
            paidAt: inst.paidAt
              ? new Date(inst.paidAt).toLocaleDateString("id-ID")
              : "-",
          });

          // Grey background for child rows
          installmentRow.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF3F3F3" },
            };
          });

          // Indent the first cell for clarity
          installmentRow.getCell("name").alignment = { indent: 1 };
        });
      }
    });

    // Add borders
    detailSheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // OUTPUT FILE
    const fileName = `Laporan_Pembayaran_${Date.now()}.xlsx`;
    const tmpDir = os.tmpdir(); // cross-platform temp folder
    const filePath = path.join(tmpDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    const downloadUrl = `/api/download?file=${fileName}`;
    return {
      ...prev,
      fileName,
      filePath,
      downloadUrl,
      success: true,
    };
  } catch (e: any) {
    return {
      ...prev,
      error: e.message,
      success: false,
    };
  }
}

export const createStaff = async (
  currentState: CurrentState,
  data: CreatestaffSchema
) => {
  try {
    let user;
    try {
      user = await client.users.createUser({
        username: data.username,
        password: data.password,
        firstName: data.name,

        publicMetadata: { role: "staff" },
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
    const createdStaff = await prisma.staff.create({
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
        birthday: new Date(data.birthday),
        staffroles: data.staffrole,
      },
    });

    return { success: true, error: false, data: createdStaff, id: user.id };
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

export const updateStaff = async (
  currentState: CurrentState,
  data: UpdatestaffSchema
) => {
  try {
    if (!data.id) {
      console.log(data.id + "Data.id");

      return { success: false, error: true, message: "Missing staff ID" };
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
    await prisma.staff.update({
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
        ...(data.img && { img: data.img }),
        sex: data.sex,
        birthday: new Date(data.birthday),
        staffroles: data.staffrole,
      },
    });
    const updatedStaff = await prisma.staff.findUnique({
      where: { id: user?.id || data.id },
    });
    if (updatedStaff?.password) {
      updatedStaff.password = decryptPassword(updatedStaff.password);
    }
    return { success: true, error: false, data: updatedStaff };
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

export const deleteStaff = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  try {
    if (!id) {
      console.log(id);
      return { success: false, error: true, message: "Missing staff ID" };
    }
    const staff = await prisma.staff.findUnique({ where: { id } });
    if (staff?.img) {
      const publicId = extractCloudinaryPublicId(staff.img);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary image deleted:", publicId);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.staff.delete({
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

    console.error("Delete Staff error: ", error);
    return { success: false, error: true, message };
  }
};

export const deleteStaffs = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const ids = formData.getAll("ids") as string[];

  if (!ids || ids.length === 0) {
    return {
      success: false,
      error: true,
      message: "Staff ID tidak ditemukan.",
    };
  }

  try {
    for (const id of ids) {
      try {
        const staff = await prisma.staff.findUnique({ where: { id } });

        if (staff?.img) {
          const publicId = extractCloudinaryPublicId(staff.img);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            console.log("Cloudinary image deleted:", publicId);
          }
        }

        await prisma.staff.delete({ where: { id } });

        try {
          const deletedUser = await client.users.deleteUser(id);
          if (deletedUser) {
            console.log("✅ Clerk user deleted:", deletedUser.id);
          }
        } catch {
          console.warn(`⚠️ Clerk user ${id} not found or already deleted.`);
        }
      } catch (innerError) {
        console.error(`❌ Failed to delete staff ID = ${id}:`, innerError);
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
