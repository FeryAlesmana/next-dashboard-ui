import prisma from "@/lib/prisma";
import { logPaymentChange } from "@/lib/paymentLogChange";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";

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

          if (action === "CREATE_INSTALLMENTS") {
            if (!log.paymentLogId) {
              return;
            }

            const createdInst = newValue?.installments || [];
            const idsToDelete = createdInst.map((i: any) => i.id);

            if (idsToDelete.length > 0) {
              await tx.paymentInstallment.deleteMany({
                where: { id: { in: idsToDelete } },
              });
            }

            // Fetch the updated payment log after deletion
            const updated = await tx.paymentLog.findUnique({
              where: { id: log.paymentLogId },
              include: { paymentInstallments: true },
            });

            // Log the revert
            await logPaymentChange({
              action: "REVERT",
              paymentLogId: log.paymentLogId,
              oldValue: newValue,
              newValue: updated,
            });

            results.push({ id: log.id, reverted: updated });

            return;
          }
          if (action === "UPDATE_INSTALLMENTS") {
            if (!log.paymentLogId) {
              return;
            }

            const oldInst =
              oldValue?.paymentInstallments || oldValue?.installments || [];

            // 1️⃣ Remove current installments
            await tx.paymentInstallment.deleteMany({
              where: { paymentLogId: log.paymentLogId },
            });

            // 2️⃣ Restore old installments
            if (oldInst.length > 0) {
              await tx.paymentInstallment.createMany({
                data: oldInst.map((i: any) => ({
                  paymentLogId: log.paymentLogId!,
                  amount: Number(i.amount),
                  paidAt: i.paidAt ? new Date(i.paidAt) : null,
                })),
              });
            }
            // 3️⃣ Fetch restored installments
            const restored = await tx.paymentInstallment.findMany({
              where: { paymentLogId: log.paymentLogId },
            });

            // 4️⃣ Recalculate totals
            const totalPaid = restored.reduce(
              (sum, inst) => sum + Number(inst.amount || 0),
              0
            );

            const paymentLog = await tx.paymentLog.findUnique({
              where: { id: log.paymentLogId },
            });

            if (!paymentLog) {
              return new NextResponse("PaymentLog not found", { status: 404 });
            }

            let finalStatus: PaymentStatus = "PENDING";
            if (totalPaid >= Number(paymentLog.amount)) {
              finalStatus = "PAID";
            } else if (totalPaid > 0) {
              finalStatus = "PARTIALLY_PAID";
            }

            // 5️⃣ Update the paymentLog status & remaining amount
            await tx.paymentLog.update({
              where: { id: paymentLog.id },
              data: {
                status: finalStatus,
              },
            });
            // 3️⃣ Fetch updated paymentLog
            const updated = await tx.paymentLog.findUnique({
              where: { id: log.paymentLogId },
              include: { paymentInstallments: true },
            });

            // 4️⃣ Log revert
            await logPaymentChange({
              action: "REVERT",
              paymentLogId: log.paymentLogId,
              oldValue: newValue,
              newValue: oldValue,
            });
            results.push({ id: log.id, reverted: updated });
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
            if (!oldValue) {
              return new NextResponse("No previous state to recreate", {
                status: 400,
              });
            }

            // extract installments from oldValue
            const oldInstallments =
              oldValue.paymentInstallments?.map((i: any) => ({
                amount: Number(i.amount),
                paidAt: i.paidAt ? new Date(i.paidAt) : null,
              })) || [];

            const recreated = await tx.paymentLog.create({
              data: {
                ...toPaymentLogUpdateInput(oldValue),
                paymentInstallments: oldInstallments.length
                  ? { createMany: { data: oldInstallments } }
                  : undefined,
              },
              include: { paymentInstallments: true },
            });

            reverted = recreated;

            await logPaymentChange({
              action: "REVERT",
              paymentLogId: recreated.id,
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
