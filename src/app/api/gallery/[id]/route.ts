import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// UPDATE caption
export async function PATCH(req: Request, { params }: Params) {
  const { caption } = await req.json();
  const { id } = await params;

  const idNumber = parseInt(id);

  const updated = await prisma.galleryImage.update({
    where: { id: idNumber },
    data: { caption },
  });

  return NextResponse.json(updated);
}
