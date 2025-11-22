import ChangeLogClient from "@/components/ChangeLogClient";
import ClientPageWrapper from "@/components/ClientWrapper";
import Pagination from "@/components/Pagination";
import prisma from "@/lib/prisma";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
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
    Object.entries(sp).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  const { page, limit, ...queryParams } = sp;
  const p = page ? parseInt(page) : 1;
  const perPage = limit === "all" ? 50 : parseInt(limit ?? "10");
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
            query.id = parseInt(value);
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
            query.action = value as ChangeAction;
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
            }
            break;
          default:
            break;
        }
    }
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
  return (
    <ClientPageWrapper key={key} role={role!}>
      <ChangeLogClient
        groups={groups}
        options={options}
        hasMore={p * perPage < count}
      />
      {/* <div className="">
        <Pagination page={p} count={count}></Pagination>
      </div> */}
    </ClientPageWrapper>
  );
};

export default ChangeLog;
