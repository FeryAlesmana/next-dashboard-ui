// scripts/sync-student-grade.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function sync() {
  const students = await prisma.student.findMany({
    where: { classId: { not: null } },
    include: { class: { select: { gradeId: true } } },
  });

  for (const s of students) {
    if (s.class?.gradeId) {
      await prisma.student.update({
        where: { id: s.id },
        data: { gradeId: s.class.gradeId },
      });
    }
  }

  console.log("✅ Synced student.gradeId with class.gradeId");
}

sync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
