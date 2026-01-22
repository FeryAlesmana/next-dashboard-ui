import ChangeLogClient from "@/components/ChangeLogClient";
import PaymentChangeListClient from "@/components/client/PaymentChangeListClient";
import ClientPageWrapper from "@/components/ClientWrapper";
import Pagination from "@/components/Pagination";
import prisma from "@/lib/prisma";
import {
  getCurrentUser,
  normalizeSearchParams,
  toIntOrNotFound,
} from "@/lib/utils";
import { ChangeAction, Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import z from "zod";

const ChangeLog = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { role } = await getCurrentUser();
  if (role !== "admin") {
    return notFound();
  }
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

  const columns = [
    {
      header: "Id Tagihan",
      accessor: "id",
    },
    {
      // Status Formulir -> Status
      header: "Nama Staff dan role",
      accessor: "name",
    },
    {
      header: "Jenis Aksi",
      accessor: "action",
    },
    {
      // Tanggal Submit -> Tgl Submit
      header: "Di Ubah pada",
      accessor: "paymentType",
    },

    ...(role === "admin"
      ? [
          {
            // 'Aksi' is already short
            header: "Aksi",
            accessor: "Caction",
          },
        ]
      : []),
  ];
  const query: Prisma.PaymentLogChangeWhereInput = {};
  let orderBy: Prisma.PaymentLogChangeOrderByWithRelationInput | undefined;
  const dateSchema = z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  });
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "search":
            query.OR = [
              {
                changedByName: { contains: value, mode: "insensitive" },
              },
              {
                changedById: { contains: value, mode: "insensitive" },
              },
              {
                changedByRole: { contains: value, mode: "insensitive" },
              },
            ];
            break;
          case "id":
            const id = toIntOrNotFound(value);
            query.id = id;
            break;
          case "byRole":
            query.changedByRole = value;
            break;
          case "createdAt":
            const parsed = dateSchema.parse(JSON.parse(value as string));
            try {
              query.createdAt = {
                gte: new Date(parsed.start),
                lte: new Date(parsed.end),
              };
            } catch {
              query.id = -1; // block tampered values
            }
            break;
          case "action":
          case "action":
            if (value === "CREATE") {
              query.action = { in: ["CREATE_BILL", "CREATE_PAYMENTS"] };
            } else if (value === "UPDATE") {
              query.action = { in: ["UPDATE_BILL", "UPDATE_PAYMENTS"] };
            } else if (value === "DELETE") {
              query.action = { in: ["DELETE_BILL", "DELETE_PAYMENTS"] };
            } else if (
              Object.values(ChangeAction).includes(value as ChangeAction)
            ) {
              query.action = value as ChangeAction;
            }
            break;

          case "sort":
            switch (value) {
              case "newest":
                orderBy = { createdAt: "desc" };
                break;
              case "oldest":
                orderBy = { createdAt: "asc" };
                break;
              case "id_asc":
                orderBy = { id: "asc" };
                break;
              case "id_desc":
                orderBy = { id: "desc" };
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
  if (!orderBy) {
    orderBy = { createdAt: "desc" }; // newest first
  }

  const [logs, count] = await prisma.$transaction([
    prisma.paymentLogChange.findMany({
      orderBy,
      where: query,
      take: perPage,
      skip: perPage ? perPage * (p - 1) : undefined,
    }),
    prisma.paymentLogChange.count({ where: query }),
  ]);

  const grouped = logs.reduce((acc: any, log) => {
    const date = log.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
    const key = `${log.changedByName}-${date}`;

    if (!acc[key]) {
      acc[key] = {
        user: log.changedByName,
        role: log.changedByRole,
        date,
        items: [],
      };
    }
    acc[key].items.push(log);
    return acc;
  }, {});
  const groups = Object.values(grouped);
  const roleOptions = [
    { label: "Semua", value: "" },
    { label: "Admin", value: "admin" },
    { label: "Staff", value: "staff" },
  ];
  const actOptions = [
    { label: "Semua", value: "" },
    { label: "Create", value: "CREATE" },
    { label: "Update", value: "UPDATE" },
    { label: "Delete", value: "DELETE" },
  ];

  const options: any = {
    roleOptions,
    actOptions,
  };
  let relatedData = {};
  return (
    <ClientPageWrapper key={key} role={role!}>
      {/* <ChangeLogClient
        groups={groups}
        options={options}
        hasMore={p * perPage < count}
      /> */}
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div>
          <PaymentChangeListClient
            options={options}
            data={logs}
            role={role!}
            columns={columns}
            relatedData={relatedData}
          />
        </div>
      </div>

      <div className="">
        <Pagination page={p} count={count}></Pagination>
      </div>
    </ClientPageWrapper>
  );
};

export default ChangeLog;
