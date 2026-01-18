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
    const currentStaffRole = await getCurrentStaff(userId!);

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
    let ppdbStatus;

    if (now < start) {
      // 1. Belum mulai
      ppdbStatus = {
        open: false,
        reason: "NOT_STARTED",
        startDate: start,
        endDate: end,
        quota: setting.quota,
        usedQuota: 0,
      };
    } else if (now > end) {
      // 2. Sudah selesai
      ppdbStatus = {
        open: false,
        reason: "ENDED",
        startDate: start,
        endDate: end,
        quota: setting.quota,
        usedQuota: 0,
      };
    } else {
      // 3. Dalam periode → cek quota
      const uniqueApplicants = await prisma.pPDB.groupBy({
        by: ["nisn"],
        where: {
          createdAt: { gte: start, lte: end },
        },
      });

      const usedQuota = uniqueApplicants.length;

      if (usedQuota >= setting.quota) {
        ppdbStatus = {
          open: false,
          reason: "QUOTA_FULL",
          startDate: start,
          endDate: end,
          quota: setting.quota,
          usedQuota: usedQuota,
        };
      } else {
        ppdbStatus = {
          open: true,
          reason: "OPEN",
          startDate: start,
          endDate: end,
          quota: setting.quota,
          usedQuota: usedQuota,
        };
      }
    }

    // 5. PPDB Buka
    return NextResponse.json({ ppdbStatus, currentStaffRole });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { open: false, reason: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
