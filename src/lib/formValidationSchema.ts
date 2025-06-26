import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Nama Mata Pelajaran harus di isi!" }),
  teachers: z.array(z.string()),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;
export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Nama Mata Pelajaran harus di isi!" }),
  capacity: z.coerce.number().min(1, { message: "Kapasitas Harus di isi!" }),
  gradeId: z.coerce
    .number()
    .min(1, { message: "Nama Mata Pelajaran harus di isi!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username harus lebih dari 3 karakter!" })
    .max(20, { message: "Username harus kurang dari 20 karakter!" }),
  password: z
    .string()
    .min(8, { message: "Password harus mempunyai 8 karakter!" })
    .or(z.literal(""))
    .optional(),
  name: z.string().min(1, { message: "Nama depan wajib diisi!" }),
  surname: z.string().min(1, { message: "Nama belakang wajib diisi!" }),
  email: z
    .string()
    .email({ message: "Email anda Tidak valid!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, { message: "Nomor telepon wajib diisi!" }),
  address: z.string().min(1, { message: "Alamat wajib diisi!" }),
  img: z.string().optional(),
  birthday: z.coerce.date({ message: "Tanggal lahir wajib disii!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Jenis Kelamin wajib diisi!" }),
  subjects: z.array(z.string()).optional(),
});
export type TeacherSchema = z.infer<typeof teacherSchema>;
export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username harus lebih dari 3 karakter!" })
    .max(20, { message: "Username harus kurang dari 20 karakter!" }),
  password: z
    .string()
    .min(8, { message: "Password harus mempunyai 8 karakter!" })
    .or(z.literal(""))
    .optional(),
  name: z.string().min(1, { message: "Nama depan wajib diisi!" }),
  surname: z.string().min(1, { message: "Nama belakang wajib diisi!" }),
  email: z
    .string()
    .email({ message: "Email anda Tidak valid!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, { message: "Nomor telepon wajib diisi!" }),
  address: z.string().min(1, { message: "Alamat wajib diisi!" }),
  img: z.string().optional(),
  birthday: z.coerce.date({ message: "Tanggal lahir wajib disii!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Jenis Kelamin wajib diisi!" }),
  gradeId: z.coerce.number().min(1, { message: "Id tingkatan wajib diisi!" }),
  classId: z.coerce.number().min(1, { message: "Id kelas wajib diisi!" }),
  parentId: z.string().min(1, { message: "Id Orangtua wajib diisi!" }),
});
export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(2, { message: "Nama Ujian wajib diisi!" }),
  startTime: z.coerce.date({ message: "Waktu mulai Ujian harus diisi" }),
  endTime: z.coerce.date({ message: "Waktu selesai Ujian wajib diisi!" }),
  lessonId: z.coerce.number({ message: "Nama pelajaran wajib di isi" }),
});

export type ExamSchema = z.infer<typeof examSchema>;
