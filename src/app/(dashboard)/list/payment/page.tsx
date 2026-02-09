import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortToggle from "@/components/FilterSortToggle";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ParentPaymentView from "@/components/client/ParentPaymentView";
import PaymentListClient from "@/components/client/PaymentListClient";
import StudentPaymentView, {
  Semester,
} from "@/components/client/StudentPaymentView";
import prisma from "@/lib/prisma";
import {
  generateSemesters,
  getCurrentStaff,
  getCurrentUser,
  normalizeSearchParams,
  toIntOrNotFound,
} from "@/lib/utils";
import {
  PaymentLog,
  PaymentStatus,
  PaymentType,
  Prisma,
  staffrole,
  Student,
} from "@prisma/client";
import { notFound } from "next/navigation";
import z from "zod";

const PaymentLogListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { role, userId } = await getCurrentUser();
  const sp = await normalizeSearchParams(searchParams);
  const key = new URLSearchParams(
    Object.entries(sp).reduce(
      (acc, [k, v]) => {
        if (v !== undefined) acc[k] = v;
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();
  const { page, limit, ...queryParams } = sp;
  const p = page ? parseInt(page) : 1;

  const perPage = limit === "all" ? 50 : parseInt(limit ?? "10");
  let staffRole: staffrole;
  if (role === "staff") {
    const staffrole = await getCurrentStaff(userId!);
    staffRole = staffrole;
  }
  const allowedStaff = role === "staff" && staffRole! === "ACCOUNTING";
  const allowedRole = role === "admin" || allowedStaff;
  const columns = [
    ...(role === "admin" || allowedStaff
      ? [
          {
            header: "Select",
            accessor: "checkbox",
          },
        ]
      : []),
    {
      header: "Nama Murid",
      accessor: "studentId",
    },
    {
      header: "NISN",
      accessor: "nisn",
      className: "hidden md:table-cell",
    },
    {
      header: "Jenis Pembayaran",
      accessor: "paymentType",
    },
    {
      header: "Jumlah",
      accessor: "amount",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
      className: "hidden md:table-cell",
    },
    {
      header: "Jumlah Pembayaran",
      accessor: "paidAmount",
      className: "hidden md:table-cell",
    },
    {
      header: "Tenggat Waktu",
      accessor: "dueDate",
      className: "hidden md:table-cell",
    },
    ...(allowedRole
      ? [
          {
            header: "Aksi",
            accessor: "action",
          },
        ]
      : []),
  ];

  const query: Prisma.PaymentLogWhereInput = {};
  let orderBy: Prisma.PaymentLogOrderByWithRelationInput | undefined;
  let semesterOptions: any = [];
  // ROLE CONDITION
  switch (role) {
    case "admin":
      const oldest = await prisma.student.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true, grade: { select: { level: true } } },
      });
      // 2️⃣ Get the highest grade level
      const highest = await prisma.grade.aggregate({
        _max: { level: true },
      });
      if (oldest) {
        semesterOptions = generateSemesters(
          oldest.createdAt,
          highest._max.level ?? 3,
          role,
        );
      }
      break;
    case "student":
      const student = await prisma.student.findUnique({
        where: {
          clerkId: userId!,
        },
        select: {
          id: true,
          name: true,
          class: {
            select: { name: true, grade: { select: { level: true } } },
          },
          student_details: { select: { nisn: true } },
          createdAt: true,
        },
      });
      if (!student) {
        return (
          <div className="p-8 text-center text-gray-500">
            Tidak ada data murid terkait akun Anda.
          </div>
        );
      }

      // ✅ TypeScript now knows student is defined below
      const gradeLevel = student.class?.grade?.level;
      const createdAt = student.createdAt;
      return (
        <>
          <StudentPaymentView
            userId={student.id!}
            gradeLevel={gradeLevel!}
            createdAt={createdAt}
          ></StudentPaymentView>
        </>
      );
    case "parent":
      const parent = await prisma.parent.findUnique({
        where: { clerkId: userId! },
        select: {
          students: {
            select: {
              id: true,
              name: true,
              classId: true,
              createdAt: true,
              class: {
                select: {
                  name: true,
                  grade: { select: { level: true } },
                },
              },
              student_details: { select: { nisn: true } },
            },
          },
          secondaryStudents: {
            select: {
              id: true,
              name: true,
              classId: true,
              createdAt: true,
              class: {
                select: {
                  name: true,
                  grade: { select: { level: true } },
                },
              },
              student_details: { select: { nisn: true } },
            },
          },
          guardianStudents: {
            select: {
              id: true,
              name: true,
              classId: true,
              createdAt: true,
              class: {
                select: {
                  name: true,
                  grade: { select: { level: true } },
                },
              },
              student_details: { select: { nisn: true } },
            },
          },
        },
      });

      const children = [
        ...(parent?.students ?? []),
        ...(parent?.secondaryStudents ?? []),
        ...(parent?.guardianStudents ?? []),
      ];

      if (children.length === 0) {
        return (
          <div className="p-8 text-center text-gray-500">
            Tidak ada data murid terkait akun Anda.
          </div>
        );
      }

      const studentsWithPayments = await Promise.all(
        children.map(async (child) => {
          const payments = await prisma.paymentLog.findMany({
            where: { studentId: child.id },
            orderBy: { dueDate: "desc" },
          });

          return {
            ...child,
            payments,
          };
        }),
      );

      return (
        <>
          {" "}
          <ParentPaymentView
            userId={userId!}
            gradeLevel={studentsWithPayments.map((s) => ({
              studentId: s.id,
              gradeLevel: s.class?.grade?.level,
              createdAt: s.createdAt,
            }))}
          ></ParentPaymentView>
        </>
      );
    case "teacher":
      query.student = {
        class: {
          supervisorId: userId!,
        },
      };
      break;

    default:
      break;
  }
  const semesterSchema = z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  });

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "search":
            query.student = {
              ...(query.student ?? {}),
              OR: [
                { name: { contains: value, mode: "insensitive" } },
                { id: { contains: value, mode: "insensitive" } },
                {
                  student_details: {
                    nisn: {
                      contains: value,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            } as Prisma.StudentWhereInput;
            break;
          case "id":
            const id = toIntOrNotFound(value);
            query.id = id;
            break;
          case "status":
            if (value === "OVERDUE") {
              query.AND = [
                { status: { not: "PAID" } },
                { dueDate: { lt: new Date() } },
              ];
            } else if (
              Object.values(PaymentStatus).includes(value as PaymentStatus)
            ) {
              query.status = value as PaymentStatus;
            } else {
              return notFound();
            }
            break;

          case "classId":
            const classId = toIntOrNotFound(value);
            query.classId = classId;
            break;
          case "gradeId":
            const gradeId = toIntOrNotFound(value);
            query.gradeId = gradeId;
            break;
          case "paymentType":
            if (Object.values(PaymentType).includes(value as PaymentType)) {
              query.paymentType = value as PaymentType;
            } else {
              // Ignore the parameter or log a warning if the value is invalid
              return notFound();
            }
            break;
          case "semester":
            try {
              const parsed = semesterSchema.parse(JSON.parse(value as string));
              query.createdAt = {
                gte: new Date(parsed.start),
                lte: new Date(parsed.end),
              };
            } catch {
              query.id = -1; // block tampered values
            }
            break;
          case "sort":
            switch (value) {
              case "pt":
                orderBy = { paymentType: "asc" };
                break;
              case "tw":
                orderBy = { dueDate: "asc" };
                break;
              case "id_asc":
                orderBy = { id: "asc" };
                break;
              case "id_desc":
                orderBy = { id: "asc" };
                break;
              default:
                return notFound();
            }
            break;
          default:
            return notFound();
        }
    }
  }
  const [data, count, classesData, studentData, gradeData, installment] =
    await prisma.$transaction([
      prisma.paymentLog.findMany({
        where: query,
        orderBy,
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
        take: perPage,
        skip: perPage ? perPage * (p - 1) : undefined,
      }),
      prisma.paymentLog.count({ where: query }),
      prisma.class.findMany({
        include: {
          grade: { select: { id: true, level: true } },
          _count: { select: { students: true } },
        },
      }),
      prisma.student.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.grade.findMany({
        select: {
          id: true,
          level: true,
        },
      }),
      prisma.paymentInstallment.findMany({
        select: {
          id: true,
          amount: true,
          paymentLogId: true, // assuming relation
          paidAt: true,
        },
      }),
    ]);
  // Convert Decimal → Number for paymentLog
  const safeData = data.map((log) => ({
    ...log,
    amount: typeof log.amount === "object" ? log.amount.toNumber() : log.amount,

    paymentInstallments: log.paymentInstallments.map((ins) => ({
      ...ins,
      amount:
        typeof ins.amount === "object" ? ins.amount.toNumber() : ins.amount,
    })),
  }));

  const remainingMap: Record<number, number> = {};
  safeData.forEach((log) => {
    const totalPaid = log.paymentInstallments.reduce(
      (acc, ins) => acc + ins.amount,
      0,
    );
    const remaining = log.amount - totalPaid;
    remainingMap[log.id] = remaining;
  });

  // Convert Decimal → Number for installments
  const safeInstallment = installment.map((inst) => ({
    ...inst,
    amount:
      typeof inst.amount === "object" ? inst.amount.toNumber() : inst.amount,
  }));

  let relatedData = {};
  relatedData = {
    studentData: studentData,
    classData: classesData,
    gradeData: gradeData,
    installment: safeInstallment,
    remainingAmount: remainingMap,
  };

  const classOptions = classesData
    .slice() // avoid mutating original array
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((cls) => ({
      label: cls.name ?? "-",
      value: cls.id.toString(),
    }));
  const gradeOptions = Array.from(
    new Set(
      classesData
        .map((cls) => cls.grade?.level)
        .filter((level): level is number => level !== undefined),
    ),
  )
    .sort((a, b) => a - b)
    .map((level) => ({
      label: level.toString(),
      value: level,
    }));
  const pStatusOptions = [
    { label: "Menunggu Pembayaran", value: "PENDING" },
    { label: "Lunas", value: "PAID" },
    { label: "Terlambat", value: "OVERDUE" },
    { label: "Dibayar Sebagian", value: "PARTIALLY_PAID" },
  ];
  const paymentTypeOptions = [
    { label: "SPP", value: "TUITION" },
    { label: "Ekstrakurikuler", value: "EXTRACURRICULAR" },
    { label: "Seragam", value: "UNIFORM" },
    { label: "Buku", value: "BOOKS" },
    { label: "Lainnya", value: "OTHER" },
  ];
  let options = {
    classOptions,
    gradeOptions,
    pStatusOptions,
    paymentTypeOptions,
    semesterOptions,
  };
  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* LIST */}
        <div className="">
          <PaymentListClient
            data={safeData}
            role={role!}
            columns={columns}
            relatedData={relatedData}
            options={options}
            staffrole={staffRole!}
          />
        </div>
        {/* PAGINATION */}
        <div className="">
          <Pagination page={p} count={count} />
        </div>
      </div>
    </ClientPageWrapper>
  );
};
export default PaymentLogListPage;
