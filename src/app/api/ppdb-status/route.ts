import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";
import { staffrole } from "@prisma/client";

export async function GET() {
  const getCurrentStaff = async (id: string | null) => {
    let staffrole;
    if (id === null) {
      return "Not-a-Staff";
    }
    const staff = await prisma.staff.findUnique({ where: { id } });
    staffrole = staff?.staffroles as staffrole;
    return staffrole;
  };
  try {
    // 1. Get PPDB Settings
    const setting = await prisma.pPDBSetting.findFirst();
    const { userId } = await getCurrentUser();
    if (!setting) {
      // If settings are not found, the application cannot determine the status
      const ppdbStatus = {
        open: false,
        reason: "SETTING_NOT_FOUND",
      };

      let currentStaffRole;
      currentStaffRole = await getCurrentStaff(userId!);

      return NextResponse.json({
        ppdbStatus,
        currentStaffRole,
      });
    }

    const now = new Date();
    const start = setting.startDate;
    const end = setting.endDate;
    let ppdbStatus: any;
    // 1. Belum dimulai
    if (now < start) {
      ppdbStatus = {
        open: false,
        reason: "NOT_STARTED",
        startDate: start,
        endDate: end,
        quota: setting.quota,
        usedQuota: 0,
      };
    }

    // 2. Sudah selesai
    if (now > end) {
      ppdbStatus = {
        open: false,
        reason: "ENDED",
        startDate: start,
        endDate: end,
        quota: setting.quota,
        usedQuota: 0,
      };
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
    let currentStaffRole;
    // 4. Kuota penuh
    currentStaffRole = await getCurrentStaff(userId!);
    if (ppdbCount >= setting.quota) {
      ppdbStatus = {
        open: false,
        reason: "QUOTA_FULL",
        startDate: start,
        endDate: end,
        quota: setting.quota,
        usedQuota: ppdbCount,
      };
    } else if (now >= start && now <= end) {
      // Sedang berlangsung (Ongoing) - Mock successful check
      ppdbStatus = {
        open: true,
        reason: "OPEN",
        startDate: start,
        endDate: end,
        quota: setting.quota,
        usedQuota: ppdbCount, // Mock usage
      };
    }
    // 5. PPDB Buka
    return NextResponse.json({ ppdbStatus, currentStaffRole });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { open: false, reason: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
