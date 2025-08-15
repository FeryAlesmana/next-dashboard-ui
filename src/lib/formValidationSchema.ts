import {
  Agama,
  assTypes,
  Awards,
  Degree,
  exTypes,
  KPS,
  parents,
  resTypes,
  TTinggal,
  UserSex,
} from "@prisma/client";
import { isValid, z } from "zod";

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
  namalengkap: z.string().min(1, { message: "Nama belakang wajib diisi!" }),
  email: z
    .string()
    .email({ message: "Email anda Tidak valid!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, { message: "Nomor telepon wajib diisi!" }),
  address: z.string().min(1, { message: "Alamat wajib diisi!" }),
  rt: z.string({ message: " RT Guru wajib diisi!" }).length(2),
  rw: z.string({ message: " RW Guru wajib diisi!" }).length(2),
  kelurahan: z.string({ message: " Nama Kelurahan Guru wajib diisi!" }).min(1),
  kecamatan: z.string({ message: " Nama Kecamatan Guru wajib diisi!" }).min(1),
  kota: z.string({ message: " Nama Kota Guru wajib diisi!" }).min(1),
  religion: z.enum(["Islam", "Kristen", "Buddha", "Lainnya"], {
    message: " Agama Guru wajib diisi!",
  }),
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
export const createTeacherSchema = teacherSchema.extend({
  password: z.string().min(8, {
    message: "Password harus mempunyai 8 karakter!",
  }),
});

export type CreateteacherSchema = z.infer<typeof createTeacherSchema>;

// For update — password is optional or empty string
export const updateTeacherSchema = teacherSchema.extend({
  password: z
    .string()
    .min(8, { message: "Password harus mempunyai 8 karakter!" })
    .or(z.literal(""))
    .optional(),
});

export type UpdateteacherSchema = z.infer<typeof updateTeacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  sdId: z.string({ message: "Student details Id harus diisi!" }),
  username: z
    .string()
    .min(3, { message: "Username harus lebih dari 3 karakter!" })
    .max(64, { message: "Username harus kurang dari 64 karakter!" }),
  name: z.string().min(1, { message: "Nama depan wajib diisi!" }),
  namalengkap: z.string().min(1, { message: "Nama belakang wajib diisi!" }),
  email: z
    .string()
    .email({ message: "Email anda Tidak valid!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, { message: "Nomor telepon wajib diisi!" }),
  noWa: z
    .string({ message: " Nomor HP Siswa wajib diisi!" })
    .min(10, { message: " Nomor HP Siswa minimal 10 karakter!" })
    .max(13)
    .regex(/^\d+$/),
  address: z.string().min(1, { message: "Alamat wajib diisi!" }),
  religion: z.nativeEnum(Agama, {
    message: " Agama Siswa wajib diisi!",
  }),
  img: z.string().optional().nullable(),
  birthday: z.coerce.date({ message: "Tanggal lahir wajib disii!" }),
  birthPlace: z.string({ message: " Tempat lahir Siswa wajib diisi!" }).min(1),
  sex: z.enum(["MALE", "FEMALE"], { message: "Jenis Kelamin wajib diisi!" }),
  asalSekolah: z
    .string({ message: " Asal sekoolah Siswa wajib diisi!" })
    .min(1),
  npsn: z.string({ message: " NPSN Siswa wajib diisi!" }),
  // .length(8)
  nisn: z.string({ message: " NISN Siswa wajib diisi!" }),
  // .length(10)
  no_ijz: z.string({ message: " No seri Ijazah Siswa wajib diisi!" }),
  // .length(12)
  nik: z.string({ message: " NIK Siswa wajib diisi!" }),
  // .length(20)
  postcode: z.coerce.number({ message: " Kode Pos Siswa wajib diisi!" }).min(5),
  rt: z.string({ message: " RT Siswa wajib diisi!" }).length(2),
  rw: z.string({ message: " RW Siswa wajib diisi!" }).length(2),
  kelurahan: z.string({ message: " Nama Kelurahan Siswa wajib diisi!" }).min(1),
  kecamatan: z.string({ message: " Nama Kecamatan Siswa wajib diisi!" }).min(1),
  kota: z.string({ message: " Nama Kota Siswa wajib diisi!" }).min(1),
  transportation: z
    .string({ message: " Transportasi Siswa wajib diisi!" })
    .min(1),
  tempat_tinggal: z.nativeEnum(TTinggal, {
    message: "Tempat tinggal siswa wajib diisi",
  }),
  kps: z
    .nativeEnum(KPS, {
      message: " KPS Siswa wajib diisi!",
    })
    .or(z.literal(""))
    .optional()
    .nullable(),
  no_kps: z
    .string({ message: " No KPS Siswa wajib diisi!" })
    // .length(16)
    // .regex(/^\d+$/)
    .or(z.literal(""))
    .optional()
    .nullable(),
  height: z.coerce
    .number({ message: " Tinggi Siswa wajib diisi!" })
    .min(100)
    .max(200),
  weight: z.coerce
    .number({ message: " Berat Siswa wajib diisi!" })
    .min(20)
    .max(90),
  distance_from_home: z.coerce
    .number({ message: " Jarak dari rumah Siswa wajib diisi!" })
    .min(1),
  time_from_home: z.coerce
    .number({ message: " Waktu tempuh Siswa wajib diisi!" })
    .min(1),
  number_of_siblings: z.coerce
    .number({ message: " Banyak saudara Siswa wajib diisi!" })
    .min(0),
  awards: z
    .string({ message: " Nama Penghargaan Siswa wajib diisi!" })
    .or(z.literal(""))
    .optional()
    .nullable(),
  awards_lvl: z
    .nativeEnum(Awards, { message: " Jenis Penghargaan Siswa wajib diisi!" })
    .or(z.literal(""))
    .optional()
    .nullable(),
  awards_date: z.coerce
    .date({ message: " Tanggal penghargaan Siswa wajib diisi!" })
    .or(z.literal(""))
    .nullable(),

  scholarship: z
    .string({ message: " Nama beasiswa Siswa wajib diisi!" })
    .or(z.literal(""))
    .optional()
    .nullable(),
  scholarship_detail: z
    .string({ message: " Sumber Beasiswa Siswa wajib diisi!" })
    .or(z.literal(""))
    .optional()
    .nullable(),
  dokumenIjazah: z.string().optional().nullable(),
  dokumenAkte: z.string().optional().nullable(),
  dokumenPasfoto: z.string().optional().nullable(),
  dokumenKKKTP: z.string().optional().nullable(),
  gradeId: z.coerce.number().min(1, { message: "Id tingkatan wajib diisi!" }),
  classId: z.coerce.number().min(1, { message: "Id kelas wajib diisi!" }),
  parentId: z
    .string()
    .min(1, { message: "Id Orangtua wajib diisi!" })
    .optional()
    .nullable(),
});
export type StudentSchema = z.infer<typeof studentSchema>;

export const createStudentSchema = studentSchema.extend({
  password: z.string().min(8, {
    message: "Password harus mempunyai 8 karakter!",
  }),
});

export type CreatestudentSchema = z.infer<typeof createStudentSchema>;

// For update — password is optional or empty string
export const updateStudentSchema = studentSchema.extend({
  password: z
    .string()
    .min(8, { message: "Password harus mempunyai 8 karakter!" })
    .or(z.literal(""))
    .optional(),
});

export type UpdatestudentSchema = z.infer<typeof updateStudentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(2, { message: "Nama Ujian wajib diisi!" }),
  startTime: z.coerce.date({ message: "Waktu mulai Ujian harus diisi" }),
  endTime: z.coerce.date({ message: "Waktu selesai Ujian wajib diisi!" }),
  lessonId: z.coerce.number({ message: "Id pelajaran wajib di isi" }),
  exType: z.nativeEnum(exTypes, { message: "Tipe Ujian wajib di isi" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(4, { message: "Event wajib diisi minimal 4 karakter!" }),
  description: z.string().min(10, { message: "Deskripsi wajib diisi minimal 10 karakter!" }),
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
  classId: z.number().nullable(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(4, { message: "Judul wajib diisi!" }),
  dueDate: z.coerce
    .date({ message: "Deadline wajib diisi!" })
    .refine((date) => date > new Date(), {
      message: "Deadline harus setelah hari ini!",
    }),
  lessonId: z.coerce.number({ message: "Id pelajaran wajib diisi!" }),
  assTypes: z.nativeEnum(assTypes, { message: "Tipe Tugas wajib diisi!" }),
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
  namalengkap: z.string().min(1, { message: "Nama belakang wajib diisi!" }),
  sex: z.nativeEnum(UserSex, {
    message: " Jenis Kelamin Calon Siswa wajib diisi!",
  }),
  waliMurid: z.nativeEnum(parents, { message: "Wali murid wajib diisi" }),

  phone: z.string().min(1, { message: "Nomor telepon wajib diisi!" }),
  birthday: z.coerce.date({ message: "Tanggal lahir Ortu wajib disii!" }),
  job: z.string().min(1, { message: "Pekerjaan Ortu wajib diisi!" }),
  degree: z.nativeEnum(Degree, {
    message: "Pendidikan Ortu wajib diisi!",
  }),
  income: z.coerce.number().min(1, { message: "Pendapatan Ortu wajib diisi!" }),
  address: z.string().min(1, { message: "Alamat wajib diisi!" }),
  students: z.array(z.string()).min(1, "Pilih minimal satu siswa"),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const createParentSchema = parentSchema.extend({
  password: z.string().min(8, {
    message: "Password harus mempunyai 8 karakter!",
  }),
});

export type CreateparentSchema = z.infer<typeof createParentSchema>;

// For update — password is optional or empty string
export const updateParentSchema = parentSchema.extend({
  password: z
    .string()
    .min(8, { message: "Password harus mempunyai 8 karakter!" })
    .or(z.literal(""))
    .optional(),
});

export type UpdateparentSchema = z.infer<typeof updateParentSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Nama Jadwal wajib diisi!" }),
  startTime: z.string().min(1, { message: "Waktu mulai wajib diisi!" }), // dulu: z.coerce.date()
  endTime: z.string().min(1, { message: "Waktu selesai wajib diisi!" }),
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
  score: z.coerce
    .number()
    .min(1, { message: "Nilai murid wajib diisi!" })
    .max(100, { message: "Maksimal 100!" }),
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
  resultType: z.nativeEnum(resTypes, {
    message: "Tipe Nilai murid wajib diisi!",
  }),
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const ppdbSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string({
    message: " nama Calon Siswa wajib diisi!",
  }),
  namalengkap: z
    .string({
      message: " nama Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  birthday: z.string({
    message: " Tanggal lahir Calon Siswa wajib diisi!",
  }),
  birthPlace: z
    .string({ message: " Tempat lahir Calon Siswa wajib diisi!" })
    .min(1),
  sex: z.enum(["MALE", "FEMALE"], {
    message: " Jenis Kelamin Calon Siswa wajib diisi!",
  }),
  religion: z.nativeEnum(Agama, {
    message: " Agama Calon Siswa wajib diisi!",
  }),
  phone: z
    .string({ message: " No telepon Calon Siswa wajib diisi!" })
    .length(11)
    .regex(/^\d+$/),
  asalSekolah: z
    .string({ message: " Asal sekoolah Calon Siswa wajib diisi!" })
    .min(1),
  npsn: z
    .string({ message: " NPSN Calon Siswa wajib diisi!" })
    .length(8)
    .regex(/^\d+$/),
  nisn: z
    .string({ message: " NISN Calon Siswa wajib diisi!" })
    .length(10)
    .regex(/^\d+$/),
  no_ijz: z
    .string({ message: " No seri Ijazah Calon Siswa wajib diisi!" })
    .length(12)
    .regex(/^\d+$/),
  nik: z
    .string({ message: " NIK Calon Siswa wajib diisi!" })
    .length(20)
    .regex(/^\d+$/),
  address: z.string({ message: " Alamat Calon Siswa wajib diisi!" }).min(1),
  postcode: z.coerce
    .number({ message: " Kode Pos Calon Siswa wajib diisi!" })
    .min(5),
  rt: z
    .string({ message: " RT Calon Siswa wajib diisi!" })
    .length(2)
    .regex(/^\d+$/),
  rw: z
    .string({ message: " RW Calon Siswa wajib diisi!" })
    .length(2)
    .regex(/^\d+$/),
  kelurahan: z
    .string({ message: " Nama Kelurahan Calon Siswa wajib diisi!" })
    .min(1)
    .regex(/^[A-Za-z\s]+$/),
  kecamatan: z
    .string({ message: " Nama Kecamatan Calon Siswa wajib diisi!" })
    .min(1)
    .regex(/^[A-Za-z\s]+$/),
  kota: z
    .string({ message: " Nama Kota Calon Siswa wajib diisi!" })
    .min(1)
    .regex(/^[A-Za-z\s]+$/),

  noWhatsapp: z
    .string({ message: " Nomor HP Calon Siswa wajib diisi!" })
    .min(10, { message: " Nomor HP Calon Siswa minimal 10 karakter!" })
    .max(13)
    .regex(/^\d+$/),
  transportation: z
    .string({ message: " Transportasi Calon Siswa wajib diisi!" })
    .min(1)
    .regex(/^[A-Za-z\s]+$/),
  tempat_tinggal: z.nativeEnum(TTinggal, {
    message: "Tempat tinggal Calon siswa wajib diisi",
  }),
  email: z.string({ message: " Email Calon Siswa wajib diisi!" }).email(),
  kps: z
    .nativeEnum(KPS, {
      message: " KPS Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  no_kps: z
    .string({ message: " No KPS Calon Siswa wajib diisi!" })
    .length(16)
    .regex(/^\d+$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  height: z.coerce
    .number({ message: " Tinggi Calon Siswa wajib diisi!" })
    .min(100)
    .max(200),
  weight: z.coerce
    .number({ message: " Berat Calon Siswa wajib diisi!" })
    .min(20)
    .max(90),
  distance_from_home: z.coerce
    .number({ message: " Jarak dari rumah Calon Siswa wajib diisi!" })
    .min(1),
  time_from_home: z.coerce
    .number({ message: " Waktu tempuh Calon Siswa wajib diisi!" })
    .min(1),
  number_of_siblings: z.coerce
    .number({ message: " Banyak saudara Calon Siswa wajib diisi!" })
    .min(0),
  awards: z
    .string({ message: " Nama Penghargaan Calon Siswa wajib diisi!" })
    .optional()
    .nullable(),
  awards_lvl: z
    .nativeEnum(Awards, {
      message: " Jenis Penghargaan Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable(),
  awards_date: z
    .string({ message: " Tanggal penghargaan Calon Siswa wajib diisi!" })
    .nullable(),

  scholarship: z
    .string({ message: " Nama beasiswa Calon Siswa wajib diisi!" })
    .optional()
    .nullable(),
  scholarship_detail: z
    .string({ message: " Sumber Beasiswa Calon Siswa wajib diisi!" })
    .optional()
    .nullable(),
  scholarship_date: z
    .string({ message: " Tanggal Beasiswa Calon Siswa wajib diisi!" })
    .optional()
    .nullable(),

  // Ayah
  namaAyah: z
    .string({ message: " Nama Ayah Calon Siswa wajib diisi!" })
    .regex(/^[A-Za-z\s]+$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  tahunLahirAyah: z
    .string({
      message: " Tanggal lahir Ayah Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  pekerjaanAyah: z
    .string({
      message: " Pekerjan Ayah Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  pendidikanAyah: z
    .nativeEnum(Degree, {
      message: " Pendidikan Ayah Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  penghasilanAyah: z.coerce
    .number({
      message: " Penghasilan Ayah Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  telpAyah: z
    .string({ message: " No telepon Ayah Calon Siswa wajib diisi!" })
    .min(11)
    .max(13)
    .regex(/^\d+$/)
    .optional()
    .nullable()
    .or(z.literal("")),

  // Ibu
  namaIbu: z
    .string({ message: " Nama Ibu Calon Siswa wajib diisi!" })
    .optional()
    .nullable()
    .or(z.literal("")),
  tahunLahirIbu: z
    .string({
      message: " Tanggal Lahir Ibu Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  pekerjaanIbu: z
    .string({
      message: " Pekerjaan Ibu Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  pendidikanIbu: z
    .nativeEnum(Degree, {
      message: " Pendidikan Ibu Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  penghasilanIbu: z.coerce
    .number({
      message: " Penghasilan Ibu Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  telpIbu: z
    .string({ message: " No telepon Ibu Calon Siswa wajib diisi!" })
    .min(11)
    .max(13)
    .regex(/^\d+$/)
    .optional()
    .nullable()
    .or(z.literal("")),

  // Wali
  namaWali: z
    .string({ message: " Nama Wali Calon Siswa wajib diisi!" })
    .regex(/^[A-Za-z\s]+$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  tahunLahirWali: z
    .string({
      message: " Tanggal Lahir Wali Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  pekerjaanWali: z
    .string({
      message: " Pekerjaan Wali Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  pendidikanWali: z
    .nativeEnum(Degree, {
      message: " Pendidikan Wali Calon Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  penghasilanWali: z.coerce
    .number({
      message: " Penghasilan Wali Siswa wajib diisi!",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  telpWali: z
    .string({ message: " No telepon Wali Calon Siswa wajib diisi!" })
    .min(11)
    .max(13)
    .regex(/^\d+$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  dokumenIjazah: z.string().optional().nullable(),
  dokumenAkte: z.string().optional().nullable(),
  dokumenPasfoto: z.string().optional().nullable(),
  dokumenKKKTP: z.string().optional().nullable(),
  isvalid: z.boolean().default(false).optional(),
  reason: z.string().optional().nullable(),
  gradeId: z.coerce
    .number()
    .min(1, { message: "Id tingkatan wajib diisi!" })
    .optional()
    .nullable(),
  classId: z.coerce
    .number()
    .min(1, { message: "Id kelas wajib diisi!" })
    .optional()
    .nullable(),
});

export type PpdbSchema = z.infer<typeof ppdbSchema>;

export const fieldLabelMap: Record<string, string> = {
  name: "Nama Calon Siswa",
  namalengkap: "Nama Panggilan",
  birthday: "Tanggal Lahir",
  birthPlace: "Tempat Lahir",
  sex: "Jenis Kelamin",
  religion: "Agama",
  phone: "No Telepon",
  asalSekolah: "Asal Sekolah",
  npsn: "NPSN",
  nisn: "NISN",
  no_ijz: "No Seri Ijazah",
  nik: "NIK",
  address: "Alamat",
  postcode: "Kode Pos",
  rt: "RT",
  rw: "RW",
  kelurahan: "Kelurahan",
  kecamatan: "Kecamatan",
  kota: "Kota",
  noWhatsapp: "No WhatsApp",
  transportation: "Transportasi",
  tempat_tinggal: "Tempat Tinggal",
  email: "Email",
  kps: "KPS",
  no_kps: "No KPS",
  height: "Tinggi Badan",
  weight: "Berat Badan",
  distance_from_home: "Jarak dari Rumah",
  time_from_home: "Waktu Tempuh",
  number_of_siblings: "Jumlah Saudara",
  awards: "Nama Penghargaan",
  awards_lvl: "Jenis Penghargaan",
  awards_date: "Tanggal Penghargaan",
  scholarship: "Nama Beasiswa",
  scholarship_detail: "Sumber Beasiswa",
  scholarship_date: "Tanggal Beasiswa",

  // Ayah
  namaAyah: "Nama Ayah",
  tahunLahirAyah: "Tahun Lahir Ayah",
  pekerjaanAyah: "Pekerjaan Ayah",
  pendidikanAyah: "Pendidikan Ayah",
  penghasilanAyah: "Penghasilan Ayah",
  telpAyah: "Telepon Ayah",

  // Ibu
  namaIbu: "Nama Ibu",
  tahunLahirIbu: "Tahun Lahir Ibu",
  pekerjaanIbu: "Pekerjaan Ibu",
  pendidikanIbu: "Pendidikan Ibu",
  penghasilanIbu: "Penghasilan Ibu",
  telpIbu: "Telepon Ibu",

  // Wali
  namaWali: "Nama Wali",
  tahunLahirWali: "Tahun Lahir Wali",
  pekerjaanWali: "Pekerjaan Wali",
  pendidikanWali: "Pendidikan Wali",
  penghasilanWali: "Penghasilan Wali",
  telpWali: "Telepon Wali",

  // Dokumen
  dokumenIjazah: "Dokumen Ijazah",
  dokumenAkte: "Dokumen Akta",
  dokumenPasfoto: "Dokumen Pas Foto",
  dokumenKKKTP: "Dokumen KK/KTP",
};

export const attendanceSchema = z.object({
  id: z.coerce.number().optional(),
  meetingId: z.coerce
    .number({ message: "Id pertemuan wajib di isi" })
    .optional(),
  meetingCount: z.coerce
    .number({ message: "Banyak pertemuan wajib di isi" })
    .min(1, { message: "Banyak pertemuan wajib di isi minimal 1" })
    .max(30, { message: "Banyak pertemuan wajib di isi maximal 30" })
    .optional(),
  lessonId: z.coerce
    .number({ message: "Id pelajaran wajib di isi" })
    .optional(),
  startTime: z
    .string()
    .min(1, { message: "Waktu mulai wajib diisi!" })
    .optional(), // dulu: z.coerce.date()
  endTime: z
    .string()
    .min(1, { message: "Waktu selesai wajib diisi!" })
    .optional(),
  date: z.coerce.date({ message: "Tanggal wajib diisi!" }).optional(),
  attendance: z
    .record(
      z.object({
        status: z.enum(["HADIR", "SAKIT", "ABSEN"], {
          required_error: "Status wajib diisi",
        }),
      })
    )
    .optional(),
});
export type AttendanceSchema = z.infer<typeof attendanceSchema>;

export const attendanceStatusEnum = z.enum(["HADIR", "SAKIT", "ABSEN"]);
export type AttendanceStatus = z.infer<typeof attendanceStatusEnum>;

export const paymentLogSchema = z.object({
  id: z.coerce.number().optional(),
  // studentId: z.string().min(1, { message: "Nama murid wajib diisi!" }),
  paymentType: z.enum([
    "TUITION",
    "EXTRACURRICULAR",
    "UNIFORM",
    "BOOKS",
    "OTHER",
  ]),
  amount: z.number().min(1, "Jumlah harus lebih dari 0"),
  dueDate: z.string().min(1, "Tenggat waktu wajib diisi"),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "PARTIALLY_PAID"]),
  description: z.string().optional(),
  paymentMethod: z.string().optional(),
  receiptNumber: z.string().optional(),
  recipientType: z.enum(["student", "class", "grade"]),
  recipientId: z.string().min(1, "Penerima wajib dipilih"),
});

export type PaymentLogSchema = z.infer<typeof paymentLogSchema>;

export const mPaymentLogSchema = z.object({
  ids: z.array(z.number().min(1)),
  paymentType: z.enum([
    "TUITION",
    "EXTRACURRICULAR",
    "UNIFORM",
    "BOOKS",
    "OTHER",
  ]),
  amount: z.number().min(1, "Jumlah harus lebih dari 0"),
  dueDate: z.string().min(1, "Tenggat waktu wajib diisi"),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "PARTIALLY_PAID"]),
  description: z.string().optional(),
  paymentMethod: z.string().optional(),
  receiptNumber: z.string().optional(),
  recipientType: z.enum(["student", "class", "grade"]),
  recipientId: z.string().min(1, "Penerima wajib dipilih"),
});

export type MpaymentLogSchema = z.infer<typeof mPaymentLogSchema>;

export const mstudentSchema = z.object({
  ids: z.array(z.string().min(1)),
  classId: z.string().min(1),
  gradeId: z.string().min(1),
});

export type MstudentSchema = z.infer<typeof mstudentSchema>;

export const mteacherSchema = z.object({
  ids: z.array(z.string().min(1)),
  subjects: z.array(z.number().min(1, { message: "Pelajaran wajib diisi!" })),
  lessons: z.array(z.number().min(1, { message: "Jadwal wajib diisi!" })),
});

export type MteacherSchema = z.infer<typeof mteacherSchema>;
export const mparentSchema = z.object({
  ids: z.array(z.string().min(1)),
  students: z.array(z.string().min(1, { message: "Siswa wajib diisi!" })),
  address: z.string().min(1, { message: "Alamat wajib diisi!" }),
});

export type MparentSchema = z.infer<typeof mparentSchema>;
export const mresultSchema = z.object({
  ids: z.array(z.number().min(1)),
  score: z.coerce
    .number()
    .min(1, { message: "Nilai murid wajib diisi!" })
    .max(100, { message: "Maksimal 100!" }),
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
  resultType: z.nativeEnum(resTypes, {
    message: "Tipe Nilai murid wajib diisi!",
  }),
});

export type MresultSchema = z.infer<typeof mresultSchema>;
export const massignmentSchema = z.object({
  ids: z.array(z.number().min(1)),
  title: z
    .string()
    .min(4, { message: "Judul wajib diisi!" })
    .or(z.literal(""))
    .optional(),
  dueDate: z.coerce
    .date({ message: "Deadline wajib diisi!" })
    .refine((date) => date > new Date(), {
      message: "Deadline harus setelah hari ini!",
    })
    .or(z.literal(""))
    .optional(),
  assType: z
    .nativeEnum(assTypes, {
      message: "Tipe Tugas murid wajib diisi!",
    })
    .or(z.literal(""))
    .optional(),
});

export type MassignmentSchema = z.infer<typeof massignmentSchema>;
export const mexamSchema = z.object({
  ids: z.array(z.number().min(1)),
  title: z
    .string()
    .min(2, { message: "Nama Ujian wajib diisi!" })
    .or(z.literal(""))
    .optional(),
  startTime: z.coerce
    .date({ message: "Waktu mulai Ujian harus diisi" })
    .or(z.literal(""))
    .optional(),
  endTime: z.coerce
    .date({ message: "Waktu selesai Ujian wajib diisi!" })
    .or(z.literal(""))
    .optional(),
  exType: z
    .nativeEnum(exTypes, { message: "Tipe Ujian wajib di isi" })
    .or(z.literal(""))
    .optional(),
});

export type MexamSchema = z.infer<typeof mexamSchema>;
