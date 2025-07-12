import { Agama, Awards, Degree, KPS, TTinggal, UserSex } from "@prisma/client";
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
  surname: z.string().min(1, { message: "Nama belakang wajib diisi!" }),
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

export const studentSchema = z.object({
  id: z.string().optional(),
  sdId: z.string({ message: "Student details Id harus diisi!" }),
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
    .optional()
    .nullable(),
  no_kps: z
    .string({ message: " No KPS Siswa wajib diisi!" })
    // .length(16)
    // .regex(/^\d+$/)
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
    .optional()
    .nullable(),
  awards_lvl: z
    .nativeEnum(Awards, { message: " Jenis Penghargaan Siswa wajib diisi!" })
    .optional()
    .nullable(),
  awards_date: z.coerce
    .date({ message: " Tanggal penghargaan Siswa wajib diisi!" })
    .nullable(),

  scholarship: z
    .string({ message: " Nama beasiswa Siswa wajib diisi!" })
    .optional()
    .nullable(),
  scholarship_detail: z
    .string({ message: " Sumber Beasiswa Siswa wajib diisi!" })
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
  classId: z.number().nullable(),
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
  sex: z.nativeEnum(UserSex, {
    message: " Jenis Kelamin Calon Siswa wajib diisi!",
  }),
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

export const ppdbSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string({
    message: " nama Calon Siswa wajib diisi!",
  }),
  surname: z
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
    .min(11)
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
