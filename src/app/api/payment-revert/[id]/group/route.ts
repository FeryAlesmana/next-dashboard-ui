import prisma from "@/lib/prisma";
import { logPaymentChange } from "@/lib/paymentLogChange";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await currentUser();
  if (user?.publicMetadata.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { ids } = await req.json();
  if (!ids || !Array.isArray(ids)) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  function toPaymentLogUpdateInput(snapshot: any): any {
    if (!snapshot) return {};

    const allowedFields = {
      studentId: true,
      amount: true,
      paymentType: true,
      status: true,
      dueDate: true,
      paidAt: true,
      description: true,
      paymentMethod: true,
      receiptNumber: true,
      classId: true,
      gradeId: true,
    };

    const cleaned: any = {};
    for (const key in snapshot) {
      if (key in allowedFields) cleaned[key] = snapshot[key];
    }
    return cleaned;
  }

  let results: any[] = [];

  try {
    await prisma.$transaction(async (tx) => {
      const logs = await tx.paymentLogChange.findMany({
        where: { id: { in: ids } },
      });

      await Promise.all(
        logs.map(async (log) => {
          const action = log.action;
          const oldValue = log.oldValue as any;
          const newValue = log.newValue as any;

          let reverted: any = null;

          // ---------------------------------------
          // CASE 1: REVERT CREATE → DELETE RECORD
          // ---------------------------------------
          if (action === "CREATE") {
            if (!log.paymentLogId) return;

            reverted = await tx.paymentLog.delete({
              where: { id: log.paymentLogId },
            });

            await logPaymentChange({
              action: "REVERT",
              paymentLogId: reverted.id,
              oldValue: newValue,
              newValue: null,
            });

            results.push({ id: log.id, reverted });
            return;
          }

          // ---------------------------------------
          // CASE 2: REVERT UPDATE → RESTORE OLD
          // ---------------------------------------
          if (action === "UPDATE") {
            if (!oldValue) return;

            await tx.paymentInstallment.deleteMany({
              where: { paymentLogId: log.paymentLogId! },
            });

            const oldInstallments =
              oldValue.paymentInstallments?.map((i: any) => ({
                amount: Number(i.amount),
                paidAt: i.paidAt ? new Date(i.paidAt) : null,
              })) || [];

            reverted = await tx.paymentLog.update({
              where: { id: log.paymentLogId! },
              data: {
                ...toPaymentLogUpdateInput(oldValue),
                paymentInstallments:
                  oldInstallments.length > 0
                    ? { createMany: { data: oldInstallments } }
                    : undefined,
              },
              include: { paymentInstallments: true },
            });

            await logPaymentChange({
              action: "REVERT",
              paymentLogId: reverted.id,
              oldValue: newValue,
              newValue: oldValue,
            });

            results.push({ id: log.id, reverted });
            return;
          }

          // ---------------------------------------
          // CASE 3: REVERT DELETE → RECREATE RECORD
          // ---------------------------------------
          if (action === "DELETE") {
            if (!oldValue) return;

            reverted = await tx.paymentLog.create({
              data: toPaymentLogUpdateInput(oldValue),
            });

            await logPaymentChange({
              action: "REVERT",
              paymentLogId: reverted.id,
              oldValue: null,
              newValue: oldValue,
            });

            results.push({ id: log.id, reverted });
            return;
          }

          // Unsupported
          results.push({ id: log.id, error: "Invalid action" });
        })
      );
    });

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Group revert failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
