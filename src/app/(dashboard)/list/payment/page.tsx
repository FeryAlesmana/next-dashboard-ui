import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortToggle from "@/components/FilterSortToggle";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ParentPaymentView from "@/components/ParentPaymentView";
import PaymentListClient from "@/components/PaymentListClient";
import StudentPaymentView from "@/components/StudentPaymentView";
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

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center p-4 gap-4">
        <Image
          src={item.student.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.student.name}</h3>
          <p className="text-xs text-gray-500">
            {item.student.class?.name || "—"}
          </p>
        </div>
      </td>
      <td className="hidden md:table-cell">
        {item.student.student_details?.nisn || "—"}
      </td>
      <td>{item.paymentType}</td>
      <td className="hidden md:table-cell">
        {item.amount.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        })}
      </td>
      <td className="hidden md:table-cell">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium
      ${item.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : ""}
      ${item.status === "PAID" ? "bg-green-100 text-green-800" : ""}
      ${item.status === "OVERDUE" ? "bg-red-100 text-red-800" : ""}
      ${item.status === "PARTIALLY_PAID" ? "bg-blue-100 text-blue-800" : ""}
    `}
        >
          {item.status === "PENDING" && "Belum Dibayar"}
          {item.status === "PAID" && "Lunas"}
          {item.status === "OVERDUE" && "Terlambat"}
          {item.status === "PARTIALLY_PAID" && "Dibayar Sebagian"}
        </span>
      </td>
      <td className="hidden md:table-cell">
        {item.dueDate.toLocaleDateString("en-UK", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        })}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer
                table="paymentLog"
                type="update"
                data={item}
              ></FormContainer>
              <FormContainer
                table="paymentLog"
                type="delete"
                id={item.id}
              ></FormContainer>
            </>
          )}
        </div>
      </td>
    </tr>
  );

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
  const [data, count, classesData, studentData] = await prisma.$transaction([
    prisma.paymentLog.findMany({
      where: query,
      orderBy,
      include: {
        student: {
          select: {
            name: true,
            namalengkap: true,
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
  ]);
  let relatedData = {};
  relatedData = { studentData: studentData, classData: classesData };

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Log Pembayaran
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                  <Image src="/filter.png" alt="" width={14} height={14} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                  <Image src="/sort.png" alt="" width={14} height={14} />
                </button> */}
              <FilterSortToggle
                filterFields={[
                  {
                    name: "classId",
                    label: "Kelas",
                    options: classesData.map((cls) => ({
                      label: cls.name,
                      value: cls.id.toString(),
                    })),
                  },
                  {
                    name: "gradeId",
                    label: "Tingkat",
                    options: Array.from(
                      new Set(
                        classesData
                          .map((cls) => cls.grade?.level)
                          .filter(
                            (level): level is number => level !== undefined
                          )
                      )
                    )
                      .sort((a, b) => a - b)
                      .map((level) => ({
                        label: level.toString(),
                        value: level,
                      })),
                  },
                  {
                    name: "paymentType",
                    label: "Jenis Pembayaran",
                    options: Array.from(
                      new Set(data.map((pt) => pt.paymentType))
                    ).map((type) => ({
                      label: type,
                      value: type,
                    })),
                  },
                  {
                    name: "status",
                    label: "Status Pembayaran",
                    options: Array.from(
                      new Set(data.map((pt) => pt.status))
                    ).map((type) => ({
                      label: type,
                      value: type,
                    })),
                  },
                ]}
                sortOptions={[
                  { label: "Tipe Pembayaran", value: "pt" },
                  { label: "Tenggat waktu", value: "tw" },
                  { label: "ID Asc", value: "id_asc" },
                  { label: "ID Desc", value: "id_desc" },
                ]}
              />

              {role === "admin" && (
                <FormContainer table="paymentLog" type="create" />
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data} /> */}
          <PaymentListClient
            data={data}
            role={role!}
            columns={columns}
            relatedData={relatedData}
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
