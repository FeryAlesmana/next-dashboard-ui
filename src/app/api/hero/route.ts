import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// CREATE multiple images
export async function POST(req: Request) {
  const { images } = await req.json(); // [{ imageUrl, caption }]
  const saved = await prisma.heroSlide.createMany({
    data: images.map((img: { imageUrl: string }) => ({
      imageUrl: img.imageUrl,
    })),
  });
  return NextResponse.json(saved);
}


// DELETE single by id
export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.heroSlide.delete({
    where: { id },
  });
  return NextResponse.json({ success: true });
}
