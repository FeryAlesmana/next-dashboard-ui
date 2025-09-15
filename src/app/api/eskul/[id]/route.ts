import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// UPDATE caption
export async function PATCH(req: Request, { params }: Params) {
  const { name } = await req.json();
  const { id } = await params;

  const idNumber = parseInt(id);

  const updated = await prisma.extracurricular.update({
    where: { id: idNumber },
    data: { name },
  });

  return NextResponse.json(updated);
}
