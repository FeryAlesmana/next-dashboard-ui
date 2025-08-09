import {
  Day,
  PrismaClient,
  UserSex,
  Agama,
  KPS,
  TTinggal,
  Awards,
  Degree,
} from "@prisma/client";

import crypto from "crypto";
const prisma = new PrismaClient();

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.PASSWORD_SECRET!)
  .digest();
const IV_LENGTH = 16;

// Encrypt password
export function encryptPassword(password: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

const grades = [];
async function main() {
  // ADMIN
  await prisma.admin.create({
    data: {
      id: "admin1",
      username: "admin1",
      password: encryptPassword("admin123"), // plain password
    },
  });
  await prisma.admin.create({
    data: {
      id: "admin2",
      username: "admin2",
      password: encryptPassword("admin456"),
    },
  });

  // GRADE & CLASS
  for (let gradeLevel = 1; gradeLevel <= 3; gradeLevel++) {
    const grade = await prisma.grade.create({
      data: {
        level: gradeLevel,
      },
    });
    grades.push(grade);

    // Create 6 classes for each grade
    for (let classNum = 1; classNum <= 6; classNum++) {
      await prisma.class.create({
        data: {
          name: `${gradeLevel}${String.fromCharCode(64 + classNum)}`,
          gradeId: grade.id,
          capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
        },
      });
    }
  }

  // SUBJECT
  const subjectData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "History" },
    { name: "Geography" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Computer Science" },
    { name: "Art" },
  ];

  for (const subject of subjectData) {
    await prisma.subject.create({ data: subject });
  }

  // TEACHER
  // There are 18 classes (6 per grade, 3 grades)
  const totalClasses = 18;
  for (let i = 1; i <= 15; i++) {
    await prisma.teacher.create({
      data: {
        id: `teacher${i}`,
        username: `teacher${i}`,
        password: encryptPassword(`teacherPass${i}`),
        name: `TName${i}`,
        namalengkap: `Tnamalengkap ${i}`,
        email: `teacher${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        rw: `${((i % 10) + 1).toString().padStart(2, "0")}`,
        rt: `${((i % 10) + 1).toString().padStart(2, "0")}`,
        kelurahan: `Kelurahan ${i}`,
        kecamatan: `Kecamatan ${i}`,
        kota: `Kota ${i}`,
        religion:
          Agama[
            Object.keys(Agama)[
              Math.floor(Math.random() * Object.keys(Agama).length)
            ] as keyof typeof Agama
          ],
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        subjects: { connect: [{ id: (i % 10) + 1 }] },
        classes: { connect: [{ id: ((i - 1) % totalClasses) + 1 }] },
        birthday: new Date(
          new Date().setFullYear(new Date().getFullYear() - 30)
        ),
      },
    });
  }

  // LESSON
  for (let i = 1; i <= 30; i++) {
    const classId = ((i - 1) % 18) + 1;
    await prisma.lesson.create({
      data: {
        name: `Lesson${i}`,
        day: Day[
          Object.keys(Day)[
            Math.floor(Math.random() * Object.keys(Day).length)
          ] as keyof typeof Day
        ],
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 3)),
        subjectId: (i % 10) + 1,
        classId: classId,
        teacherId: `teacher${(i % 15) + 1}`,
      },
    });
  }

  // PARENT
  for (let i = 1; i <= 25; i++) {
    await prisma.parent.create({
      data: {
        id: `parentId${i}`,
        username: `parentId${i}`,
        password: encryptPassword(`parenttPass${i}`),
        name: `PName ${i}`,
        namalengkap: `Pnamalengkap ${i}`,
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        email: `parent${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        job: `Job${i}`,
        income: 1000000 + i * 10000,
        degree:
          Degree[
            Object.keys(Degree)[
              Math.floor(Math.random() * Object.keys(Degree).length)
            ] as keyof typeof Degree
          ],
        birthday: new Date(
          new Date().setFullYear(new Date().getFullYear() - 30)
        ),
      },
    });
  }

  // STUDENT
  for (let i = 1; i <= 50; i++) {
    const parentIndex1 = Math.floor(Math.random() * 25) + 1;
    let parentIndex2 = Math.floor(Math.random() * 25) + 1;
    let guardianIndex = Math.floor(Math.random() * 25) + 1;

    // Ensure all parents are different
    while (parentIndex2 === parentIndex1) {
      parentIndex2 = Math.floor(Math.random() * 25) + 1;
    }
    while (guardianIndex === parentIndex1 || guardianIndex === parentIndex2) {
      guardianIndex = Math.floor(Math.random() * 25) + 1;
    }

    // Assign grade and class
    const gradeId = ((i - 1) % 3) + 1;
    const classId = ((i - 1) % 18) + 1;

    const student = await prisma.student.create({
      data: {
        id: `student${i}`,
        username: `student${i}`,
        password: encryptPassword(`studentPass${i}`),
        name: `SName${i}`,
        namalengkap: `Snamalengkap ${i}`,
        email: `student${i}@example.com`,
        phone: `987-654-321${i}`,
        address: `Address${i}`,
        rw: `${((i % 10) + 1).toString().padStart(2, "0")}`,
        rt: `${((i % 10) + 1).toString().padStart(2, "0")}`,
        kelurahan: `Kelurahan ${i}`,
        kecamatan: `Kecamatan ${i}`,
        kota: `Kota ${i}`,
        religion:
          Agama[
            Object.keys(Agama)[
              Math.floor(Math.random() * Object.keys(Agama).length)
            ] as keyof typeof Agama
          ],
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        parentId: `parentId${parentIndex1}`,
        secondParentId: `parentId${parentIndex2}`,
        guardianId: `parentId${guardianIndex}`,
        gradeId: gradeId,
        classId: classId,
        birthday: new Date(
          new Date().setFullYear(new Date().getFullYear() - 10)
        ),
      },
    });

    await prisma.student_details.create({
      data: {
        studentId: student.id,
        birthPlace: `birthplace${i}`,
        nisn: `100000 ${i}`,
        npsn: `200000 ${i}`,
        no_ijz: `300000 ${i}`,
        nik: `400000 ${i}`,
        asalSekolah: `SD ${i}`,
        kps: KPS[
          Object.keys(KPS)[
            Math.floor(Math.random() * Object.keys(KPS).length)
          ] as keyof typeof KPS
        ],
        no_kps: `500000 ${i}`,
        height: 140 + (i % 20),
        weight: 40 + (i % 10),
        transportation: `transport ${i}`,
        tempat_tinggal:
          TTinggal[
            Object.keys(TTinggal)[
              Math.floor(Math.random() * Object.keys(TTinggal).length)
            ] as keyof typeof TTinggal
          ],
        distance_from_home: 2 + (i % 5),
        time_from_home: 15 + (i % 30),
        number_of_siblings: i % 4,
        postcode: 16100 + i,
        awards: `Award ${i}`,
        awards_lvl:
          Awards[
            Object.keys(Awards)[
              Math.floor(Math.random() * Object.keys(Awards).length)
            ] as keyof typeof Awards
          ],
        awards_date: new Date(new Date().setFullYear(2023)),
        scholarship: i % 2 === 0 ? "KIP" : "Beasiswa Prestasi",
        scholarship_detail: `Detail scholarship ${i}`,
      },
    });
  }

  console.log("✅ Done seeding students + student_details.");

  // EXAM
  for (let i = 1; i <= 10; i++) {
    await prisma.exam.create({
      data: {
        title: `Exam ${i}`,
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        lessonId: (i % 30) + 1,
      },
    });
  }

  // ASSIGNMENT
  for (let i = 1; i <= 10; i++) {
    await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`,
        startDate: new Date(new Date().setHours(new Date().getHours() + 1)),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        lessonId: (i % 30) + 1,
      },
    });
  }

  // RESULT
  for (let i = 1; i <= 10; i++) {
    await prisma.result.create({
      data: {
        score: 90,
        studentId: `student${i}`,
        ...(i <= 5 ? { examId: i } : { assignmentId: i - 5 }),
      },
    });
  }

  // ATTENDANCE
  for (let i = 1; i <= 10; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(),
        present: true,
        studentId: `student${i}`,
        lessonId: (i % 30) + 1,
      },
    });
  }

  // EVENT
  for (let i = 1; i <= 5; i++) {
    const classId = ((i - 1) % 18) + 1;
    await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `Description for Event ${i}`,
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        classId: classId,
      },
    });
  }

  // ANNOUNCEMENT
  for (let i = 1; i <= 5; i++) {
    const classId = ((i - 1) % 18) + 1;
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`,
        description: `Description for Announcement ${i}`,
        date: new Date(),
        classId: classId,
      },
    });
  }

  console.log("Seeding completed successfully.");

  // Insert PPDB dummy data
  await insertPpdbDummyData();
  // Function to insert PPDB dummy data
  async function insertPpdbDummyData() {
    for (const data of ppdbDummyData) {
      await prisma.pPDB.create({ data });
    }
    console.log("✅ Inserted 3 PPDB dummy data.");
  }
}

// PPDB DUMMY DATA
const ppdbDummyData = [
  {
    name: "Budi",
    namalengkap: "Santoso",
    birthday: new Date("2015-05-10T00:00:00.000Z"),
    birthPlace: "Jakarta",
    sex: "MALE" as UserSex,
    religion: "Islam" as Agama,
    phone: "08123456789",
    asalSekolah: "SDN 01 Jakarta",
    npsn: "12345678",
    nisn: "1234567890",
    no_ijz: "123456789012",
    nik: "12345678901234567890",
    address: "Jl. Merdeka No. 1",
    postcode: 12345,
    rt: "01",
    rw: "02",
    kelurahan: "Menteng",
    kecamatan: "Menteng",
    kota: "Jakarta",
    // noWhatsapp: "081234567890",
    transportation: "Mobil",
    tempat_tinggal: "Orang_Tua" as TTinggal,
    email: "budi@example.com",
    kps: null,
    no_kps: null,
    height: 150,
    weight: 40,
    distance_from_home: 5,
    time_from_home: 20,
    number_of_siblings: 2,
    awards: "Juara 1 Matematika",
    awards_lvl: "nasional" as Awards,
    awards_date: new Date("2024-06-01T00:00:00.000Z"),
    scholarship: "KIP",
    scholarship_detail: "KIP 2024",
    scholarship_date: new Date("2024-07-01T00:00:00.000Z"),
    namaAyah: "Slamet Santoso",
    tahunLahirAyah: new Date("1980-01-01T00:00:00.000Z"),
    pekerjaanAyah: "Pegawai Negeri",
    pendidikanAyah: "S1" as Degree,
    penghasilanAyah: 5000000,
    telpAyah: "081234567891",
    namaIbu: "Siti Aminah",
    tahunLahirIbu: new Date("1982-02-02T00:00:00.000Z"),
    pekerjaanIbu: "Ibu Rumah Tangga",
    pendidikanIbu: "SMA" as Degree,
    penghasilanIbu: 3000000,
    telpIbu: "081234567892",
    namaWali: "",
    tahunLahirWali: null,
    pekerjaanWali: "",
    pendidikanWali: "SMA" as Degree,
    penghasilanWali: 0,
    telpWali: "",
    dokumenIjazah: "",
    dokumenAkte: "",
    dokumenPasfoto: "",
    dokumenKKKTP: "",
    isvalid: false,
    // reason: "",
    // gradeId: 1,
    // classId: 1,
  },
  {
    name: "Ani",
    namalengkap: "Wijaya",
    birthday: new Date("2015-08-15T00:00:00.000Z"),
    birthPlace: "Bandung",
    sex: "FEMALE" as UserSex,
    religion: "Kristen" as Agama,
    phone: "08123456788",
    asalSekolah: "SDN 02 Bandung",
    npsn: "87654321",
    nisn: "0987654321",
    no_ijz: "210987654321",
    nik: "09876543210987654321",
    address: "Jl. Asia Afrika No. 2",
    postcode: 54321,
    rt: "03",
    rw: "04",
    kelurahan: "Braga",
    kecamatan: "Sumur Bandung",
    kota: "Bandung",
    // noWhatsapp: "081234567893",
    transportation: "Sepeda",
    tempat_tinggal: "Orang_Tua" as TTinggal,
    email: "ani@example.com",
    kps: "KIS" as KPS,
    no_kps: "1234567890123456",
    height: 145,
    weight: 38,
    distance_from_home: 3,
    time_from_home: 15,
    number_of_siblings: 1,
    awards: "Juara 2 IPA",
    awards_lvl: "kota" as Awards,
    awards_date: new Date("2024-05-15T00:00:00.000Z"),
    scholarship: "Beasiswa Prestasi",
    scholarship_detail: "Prestasi 2024",
    scholarship_date: new Date("2024-07-02T00:00:00.000Z"),
    namaAyah: "Bambang Wijaya",
    tahunLahirAyah: new Date("1978-03-03T00:00:00.000Z"),
    pekerjaanAyah: "Wiraswasta",
    pendidikanAyah: "SMA" as Degree,
    penghasilanAyah: 4000000,
    telpAyah: "081234567894",
    namaIbu: "Dewi Lestari",
    tahunLahirIbu: new Date("1980-04-04T00:00:00.000Z"),
    pekerjaanIbu: "Guru",
    pendidikanIbu: "S1" as Degree,
    penghasilanIbu: 3500000,
    telpIbu: "081234567895",
    namaWali: "",
    tahunLahirWali: null,
    pekerjaanWali: "",
    pendidikanWali: "SMA" as Degree,
    penghasilanWali: 0,
    telpWali: "",
    dokumenIjazah: "",
    dokumenAkte: "",
    dokumenPasfoto: "",
    dokumenKKKTP: "",
    isvalid: false,
    // reason: "",
    // gradeId: 2,
    // classId: 7,
  },
  {
    name: "Joko",
    namalengkap: "Susilo",
    birthday: new Date("2015-12-20T00:00:00.000Z"),
    birthPlace: "Surabaya",
    sex: "MALE" as UserSex,
    religion: "Buddha" as Agama,
    phone: "08123456787",
    asalSekolah: "SDN 03 Surabaya",
    npsn: "11223344",
    nisn: "1122334455",
    no_ijz: "554433221100",
    nik: "11223344556677889900",
    address: "Jl. Pemuda No. 3",
    postcode: 67890,
    rt: "05",
    rw: "06",
    kelurahan: "Genteng",
    kecamatan: "Genteng",
    kota: "Surabaya",
    // noWhatsapp: "081234567896",
    transportation: "Angkot",
    tempat_tinggal: "Orang_Tua" as TTinggal,
    email: "joko@example.com",
    kps: null,
    no_kps: null,
    height: 148,
    weight: 39,
    distance_from_home: 4,
    time_from_home: 18,
    number_of_siblings: 3,
    awards: "Juara 3 Bahasa Inggris",
    awards_lvl: "provinsi" as Awards,
    awards_date: new Date("2024-04-20T00:00:00.000Z"),
    scholarship: "Beasiswa Bahasa",
    scholarship_detail: "Bahasa 2024",
    scholarship_date: new Date("2024-07-03T00:00:00.000Z"),
    namaAyah: "Sutrisno Susilo",
    tahunLahirAyah: new Date("1975-05-05T00:00:00.000Z"),
    pekerjaanAyah: "Petani",
    pendidikanAyah: "SMA" as Degree,
    penghasilanAyah: 2500000,
    telpAyah: "081234567897",
    namaIbu: "Sri Wahyuni",
    tahunLahirIbu: new Date("1977-06-06T00:00:00.000Z"),
    pekerjaanIbu: "Pedagang",
    pendidikanIbu: "SMA" as Degree,
    penghasilanIbu: 2000000,
    telpIbu: "081234567898",
    namaWali: "",
    tahunLahirWali: null,
    pekerjaanWali: "",
    pendidikanWali: "SMA" as Degree,
    penghasilanWali: 0,
    telpWali: "",
    dokumenIjazah: "",
    dokumenAkte: "",
    dokumenPasfoto: "",
    dokumenKKKTP: "",
    isvalid: false,
    // reason: "",
    // gradeId: 3,
    // classId: 13,
  },
];
// You can use ppdbDummyData for testing or insert into your database as needed.

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
