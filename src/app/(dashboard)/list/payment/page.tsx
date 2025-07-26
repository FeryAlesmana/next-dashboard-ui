import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { PaymentLog, Prisma, Student } from "@prisma/client";
import Image from "next/image";

type PaymentLogList = PaymentLog & {
  student: Student;
};

const PaymentLogListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const sp = normalizeSearchParams(searchParams);
  const { page, ...queryParams } = await sp;
  const p = page ? parseInt(page) : 1;
  const { role, userId } = await getCurrentUser();

  const columns = [
    {
      header: "Id pembayaran",
      accessor: "Payment ID",
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
    // {
    //   header: "Status",
    //   accessor: "status",
    //   className: "hidden md:table-cell",
    // },
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

  const renderRow = (item: PaymentLogList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center p-4 gap-4">{item.id}</td>
      <td>{item.paymentType}</td>
      <td className="hidden md:table-cell">
        {item.amount.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        })}
      </td>
      {/* <td className="hidden md:table-cell">{item.status}</td> */}
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
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.student = {
              OR: [
                { name: { contains: value, mode: "insensitive" } },
                { surname: { contains: value, mode: "insensitive" } },
              ],
            };
            break;
          case "status":
            query.status = value as any;
            break;
          default:
            break;
        }
      }
    }

    // ROLE CONDITION
    switch (role) {
      case "admin":
        break;
      case "student":
        query.studentId = userId!;
        break;
      case "parent":
        query.student = {
          OR: [
            { parentId: userId! },
            { secondParentId: userId! },
            { guardianId: userId! },
          ],
        };
        break;
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

    const [data, count] = await prisma.$transaction([
      prisma.paymentLog.findMany({
        where: query,
        include: {
          student: { select: { name: true, surname: true } },
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.paymentLog.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Log Pembayaran
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="" width={14} height={14} />
              </button>
              {role === "admin" && (
                <FormContainer table="paymentLog" type="create" />
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <div className="">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
        {/* PAGINATION */}
        <div className="">
          <Pagination page={p} count={count} />
        </div>
      </div>
    );
  }
};
export default PaymentLogListPage;
