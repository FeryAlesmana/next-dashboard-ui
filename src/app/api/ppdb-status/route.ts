import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.pPDBSetting.findFirst();

    if (!setting) {
      return NextResponse.json({
        open: false,
        reason: "SETTING_NOT_FOUND",
      });
    }

    const now = new Date();
    const start = setting.startDate;
    const end = setting.endDate;

    // 1. Belum dimulai
    if (now < start) {
      return NextResponse.json({
        open: false,
        reason: "NOT_STARTED",
        startDate: start,
        endDate: end,
        quota: setting.quota,
        usedQuota: 0,
      });
    }

    // 2. Sudah selesai
    if (now > end) {
      return NextResponse.json({
        open: false,
        reason: "ENDED",
        startDate: start,
        endDate: end,
        quota: setting.quota,
        usedQuota: 0,
      });
    }

    // 3. Hitung PPDB yang mendaftar dalam periode
    const ppdbCount = await prisma.pPDB.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // 4. Kuota penuh
    if (ppdbCount >= setting.quota) {
      return NextResponse.json({
        open: false,
        reason: "QUOTA_FULL",
        startDate: start,
        endDate: end,
        quota: setting.quota,
        usedQuota: ppdbCount,
      });
    }

    // 5. PPDB Buka
    return NextResponse.json({
      open: true,
      reason: "OPEN",
      startDate: start,
      endDate: end,
      quota: setting.quota,
      usedQuota: ppdbCount,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { open: false, reason: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
