import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = {
  params: { id: string };
};

// UPDATE caption
export async function PATCH(req: Request, { params }: Params) {
  const { caption } = await req.json();
  const id = parseInt(params.id);

  const updated = await prisma.galleryImage.update({
    where: { id },
    data: { caption },
  });

  return NextResponse.json(updated);
}
