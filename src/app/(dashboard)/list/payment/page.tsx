import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortToggle from "@/components/FilterSortToggle";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ParentPaymentView from "@/components/client/ParentPaymentView";
import PaymentListClient from "@/components/client/PaymentListClient";
import StudentPaymentView from "@/components/client/StudentPaymentView";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { PaymentLog, PaymentType, Prisma, Student } from "@prisma/client";
import Image from "next/image";

// type PaymentLogList = PaymentLog & {
//   student: Student;
// };

const PaymentLogListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { role, userId } = await getCurrentUser();
  const sp = await normalizeSearchParams(searchParams);
  const key = new URLSearchParams(
    Object.entries(sp).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  const { page, limit, ...queryParams } = sp;
  const p = page ? parseInt(page) : 1;
  const perPage = limit === "all" ? undefined : parseInt(limit ?? "10");

  const columns = [
    ...(role === "admin"
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
      header: "Tenggat Waktu",
      accessor: "dueDate",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
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

  // ROLE CONDITION
  switch (role) {
    case "admin":
      break;
    case "student":
      const student = await prisma.student.findUnique({
        where: {
          id: userId!,
        },
        select: {
          id: true,
          name: true,
          namalengkap: true,
          class: {
            select: { name: true, grade: { select: { level: true } } },
          },
          student_details: { select: { nisn: true } },
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
      return (
        <>
          <StudentPaymentView
            userId={userId!}
            gradeLevel={gradeLevel!}
          ></StudentPaymentView>
        </>
      );
    case "parent":
      const children = await prisma.student.findMany({
        where: {
          OR: [
            { parentId: userId! },
            { secondParentId: userId! },
            { guardianId: userId! },
          ],
        },
        select: {
          id: true,
          name: true,
          namalengkap: true,
          class: {
            select: { name: true, grade: { select: { level: true } } },
          },
          student_details: { select: { nisn: true } },
        },
      });

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
        })
      );

      const gradeLevels = children
        .map((child: any) => child.class?.grade?.level)
        .filter(Boolean);

      return (
        <>
          {" "}
          <ParentPaymentView
            userId={userId!}
            gradeLevel={studentsWithPayments.map((s) => ({
              studentId: s.id,
              gradeLevel: s.class?.grade?.level,
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

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "search":
            query.student = {
              ...(query.student ?? {}),
              OR: [
                { name: { contains: value, mode: "insensitive" } },
                { namalengkap: { contains: value, mode: "insensitive" } },
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
          case "status":
            query.status = value as any;
            break;
          case "classId":
            query.classId = parseInt(value);
            break;
          case "gradeId":
            query.gradeId = parseInt(value);
            break;
          case "paymentType":
            query.paymentType = value as PaymentType;
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
            }
            break;
          default:
            break;
        }
    }
  }
  const [data, count, classesData, studentData, gradeData] =
    await prisma.$transaction([
      prisma.paymentLog.findMany({
        where: query,
        orderBy,
        include: {
          student: {
            select: {
              name: true,
              namalengkap: true,
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
          namalengkap: true,
        },
      }),
      prisma.grade.findMany({
        select: {
          id: true,
          level: true,
        },
      }),
    ]);
  let relatedData = {};
  relatedData = {
    studentData: studentData,
    classData: classesData,
    gradeData: gradeData,
  };

  const classOptions = classesData.map((cls) => ({
    label: cls.name,
    value: cls.id.toString(),
  }));
  const gradeOptions = Array.from(
    new Set(
      classesData
        .map((cls) => cls.grade?.level)
        .filter((level): level is number => level !== undefined)
    )
  )
    .sort((a, b) => a - b)
    .map((level) => ({
      label: level.toString(),
      value: level,
    }));
  const pStatusOptions = Array.from(new Set(data.map((pt) => pt.status))).map(
    (type) => ({
      label: type,
      value: type,
    })
  );

  let options = {
    classOptions,
    gradeOptions,
    pStatusOptions,
  };
  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* LIST */}
        <div className="">
          <PaymentListClient
            data={data}
            role={role!}
            columns={columns}
            relatedData={relatedData}
            options={options}
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
