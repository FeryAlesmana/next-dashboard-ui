import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = {
  params: { id: string };
};

// UPDATE caption
export async function PATCH(req: Request, { params }: Params) {
  const { name } = await req.json();
  const id = parseInt(params.id);

  const updated = await prisma.extracurricular.update({
    where: { id },
    data: { name },
  });

  return NextResponse.json(updated);
}
