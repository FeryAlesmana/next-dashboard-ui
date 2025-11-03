import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: ["warn", "error", "info"],
  });

  // Example: extend to sync student.gradeId
  return client.$extends({
    query: {
      student: {
        async create({ args, query }) {
          if (args.data.classId) {
            const cls = await client.class.findUnique({
              where: { id: args.data.classId },
              select: { gradeId: true },
            });

            if (cls?.gradeId) args.data.gradeId = cls.gradeId;
          }
          return query(args);
        },
        async update({ args, query }) {
          // 🧠 Normalize and safely extract the classId value
          const classIdValue =
            typeof args.data.classId === "object"
              ? args.data.classId?.set ?? null
              : args.data.classId ?? null;

          if (classIdValue !== null && classIdValue !== undefined) {
            const cls = await client.class.findUnique({
              where: { id: classIdValue },
              select: { gradeId: true },
            });

            if (cls?.gradeId !== null && cls?.gradeId !== undefined) {
              args.data.gradeId = cls.gradeId;
            }
          }

          return query(args);
        },
      },
    },
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton>;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
