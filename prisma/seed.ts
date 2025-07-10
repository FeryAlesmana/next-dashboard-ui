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
const prisma = new PrismaClient();
const grades = [];
async function main() {
  // ADMIN
  await prisma.admin.create({
    data: {
      id: "admin1",
      username: "admin1",
    },
  });
  await prisma.admin.create({
    data: {
      id: "admin2",
      username: "admin2",
    },
  });

  // GRADE
  for (let i = 1; i <= 3; i++) {
    const grade = await prisma.grade.create({
      data: {
        level: i,
      },
    });
    grades.push(grade);
  }

  // CLASS
  for (let i = 1; i <= 3; i++) {
    await prisma.class.create({
      data: {
        name: `${i}A`,
        gradeId: i,
        capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
      },
    });
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
  for (let i = 1; i <= 15; i++) {
    await prisma.teacher.create({
      data: {
        id: `teacher${i}`, // Unique ID for the teacher
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `teacher${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        religion:
          Agama[
            Object.keys(Agama)[
              Math.floor(Math.random() * Object.keys(Agama).length)
            ] as keyof typeof Agama
          ],
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        subjects: { connect: [{ id: (i % 10) + 1 }] },
        classes: { connect: [{ id: (i % 3) + 1 }] },
        birthday: new Date(
          new Date().setFullYear(new Date().getFullYear() - 30)
        ),
      },
    });
  }

  // LESSON
  for (let i = 1; i <= 30; i++) {
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
        classId: (i % 3) + 1,
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
        name: `PName ${i}`,
        surname: `PSurname ${i}`,
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
    const student = await prisma.student.create({
      data: {
        id: `student${i}`,
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname ${i}`,
        email: `student${i}@example.com`,
        phone: `987-654-321${i}`,
        address: `Address${i}`,
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
        gradeId: (i % 3) + 1,
        classId: (i % 3) + 1,
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
    await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `Description for Event ${i}`,
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        classId: (i % 2) + 1,
      },
    });
  }

  // ANNOUNCEMENT
  for (let i = 1; i <= 5; i++) {
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`,
        description: `Description for Announcement ${i}`,
        date: new Date(),
        classId: (i % 2) + 1,
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
