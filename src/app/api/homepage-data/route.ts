import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const heroSlides = await prisma.heroSlide.findMany({
      orderBy: { createdAt: "desc" },
    });

    const gallery = await prisma.galleryImage.findMany({
      orderBy: { createdAt: "desc" },
    });

    const eskul = await prisma.extracurricular.findMany({
      orderBy: { createdAt: "asc" },
    });

    const penunjang = await prisma.supportActivity.findMany({
      orderBy: { createdAt: "asc" },
    });
    const ppdbSettings = await prisma.pPDBSetting.findFirst({});

    return NextResponse.json({
      heroSlides,
      gallery,
      eskul,
      penunjang,
      ppdbSettings,
    });
  } catch (error) {
    console.error("Failed to fetch homepage data", error);
    return NextResponse.json(
      { error: "Failed to fetch homepage data" },
      { status: 500 }
    );
  }
}
