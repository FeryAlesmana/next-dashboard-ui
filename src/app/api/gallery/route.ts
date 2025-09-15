import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// CREATE multiple images
export async function POST(req: Request) {
  const { images } = await req.json(); // [{ imageUrl, caption }]
  const saved = await prisma.galleryImage.createMany({
    data: images.map((img: { imageUrl: string; caption?: string }) => ({
      imageUrl: img.imageUrl,
      caption: img.caption ?? null,
    })),
  });
  return NextResponse.json(saved);
}

// READ all
export async function GET() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(images);
}

// DELETE single by id
export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.galleryImage.delete({
    where: { id },
  });
  return NextResponse.json({ success: true });
}
