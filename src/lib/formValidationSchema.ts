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
  img: z.string().optional().nullable(),
  birthday: z.coerce.date({ message: "Tanggal lahir wajib disii!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Jenis Kelamin wajib diisi!" }),
  subjects: z
    .array(z.number().min(1, { message: "Pelajaran wajib diisi!" }))
    .optional(),
  lessons: z
    .array(z.number().min(1, { message: "Jadwal wajib diisi!" }))
    .optional(),
  classes: z
    .array(z.number().min(1, { message: "Kelas wajib diisi!" }))
    .optional(),
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
  img: z.string().optional().nullable(),
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
  lessonId: z.coerce.number({ message: "Id pelajaran wajib di isi" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(4, { message: "Event wajib diisi!" }),
  description: z.string().min(10, { message: "Deskripsi wajib diisi!" }),
  startTime: z.coerce.date({ message: "Waktu mulai event wajib diisi!" }),
  endTime: z.coerce.date({ message: "Waktu ahir event wajib diisi!" }),
  classId: z.coerce.number({ message: "Id kelas wajib di isi" }),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(4, { message: "Event wajib diisi!" }),
  description: z.string().min(10, { message: "Deskripsi wajib diisi!" }),
  date: z.coerce.date({ message: "Tanggal wajib diisi!" }),
  classId: z.preprocess((val) => {
    if (val === "" || val === undefined) return null;
    return Number(val);
  }, z.number().nullable()),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(4, { message: "Event wajib diisi!" }),
  classId: z.coerce.number({ message: "Id kelas wajib diisi!" }),
  dueDate: z.coerce.date({ message: "deadline wajib diisi!" }),
  lessonId: z.coerce.number({ message: "Id pelajaran wajib di isi" }),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const parentSchema = z.object({
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
  email: z.string().email({ message: "Email anda Tidak valid!" }),
  name: z.string().min(1, { message: "Nama depan wajib diisi!" }),
  surname: z.string().min(1, { message: "Nama belakang wajib diisi!" }),
  phone: z.string().min(1, { message: "Nomor telepon wajib diisi!" }),
  address: z.string().min(1, { message: "Alamat wajib diisi!" }),
  students: z.array(z.string()).min(1, "Pilih minimal satu siswa"),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Nama Jadwal wajib diisi!" }),
  startTime: z.coerce.date({ message: "Waktu mulai wajib diisi!" }),
  endTime: z.coerce.date({ message: "Waktu selesai wajib diisi!" }),
  subjectId: z.coerce.number({ message: "Id pelajaran wajib di isi" }),
  classId: z.coerce.number({ message: "Id Kelas wajib di isi" }),
  teacherId: z.string({ message: "Id guru wajib di isi" }),
  day: z.enum(["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"], {
    message: "Hari jadwal wajib diisi!",
  }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  studentId: z.string().min(1, { message: "Nama murid wajib diisi!" }),
  score: z.coerce.number().min(1, { message: "Nilai murid wajib diisi!" }),
  examId: z.coerce
    .number({ message: "Id Ujian wajib diisi!" })
    .optional()
    .nullable(),
  assignmentId: z.coerce
    .number({ message: "Id Tugas wajib diisi!" })
    .optional()
    .nullable(),
  selectedType: z.enum(["Ujian", "Tugas", ""], {
    message: "Tipe Hasil wajib diisi!",
  }),
});

export type ResultSchema = z.infer<typeof resultSchema>;
