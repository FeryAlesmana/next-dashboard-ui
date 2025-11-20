import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const perPage = 10;

  const skip = (page - 1) * perPage;

  // fetch raw logs
  const logs = await prisma.paymentLogChange.findMany({
    orderBy: { createdAt: "desc" },
    take: perPage,
    skip,
  });

  // group them EXACTLY like your server component
  const grouped = logs.reduce((acc: any, log) => {
    const date = log.createdAt.toISOString().slice(0, 10);
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

  return NextResponse.json({
    groups: Object.values(grouped),
  });
}
