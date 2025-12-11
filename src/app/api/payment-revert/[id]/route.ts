import { logPaymentChange } from "@/lib/paymentLogChange";
import prisma from "@/lib/prisma";
import { toPaymentLogUpdateInput } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
type Params = {
  params: Promise<{
    id: string;
  }>;
};
export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const changeId = parseInt(id);
  const user = await currentUser();

  if (user?.publicMetadata.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const log = await prisma.paymentLogChange.findUnique({
    where: { id: changeId },
  });

  if (!log) return new NextResponse("Not Found", { status: 404 });
  const action = log.action;
  const oldValue = log.oldValue as any;
  const newValue = log.newValue as any;

  let reverted: any = null;

  // ----------------------------------------
  //  CASE 1: REVERTING A "CREATE"
  //  -> Delete the payment log entirely
  // ----------------------------------------
  if (action === "CREATE") {
    if (!log.paymentLogId) {
      return new NextResponse("Missing paymentLogId for revert", {
        status: 400,
      });
    }

    reverted = await prisma.paymentLog.delete({
      where: { id: log.paymentLogId },
    });

    await logPaymentChange({
      action: "REVERT",
      paymentLogId: reverted.paymentLogId,
      oldValue: newValue, // value that was created
      newValue: null,
    });

    return NextResponse.json({ success: true, reverted });
  }
  if (action === "CREATE_INSTALLMENTS") {
    if (!log.paymentLogId) {
      return new NextResponse("Missing paymentLogId for revert", {
        status: 400,
      });
    }

    const createdInst = newValue?.installments || [];
    const idsToDelete = createdInst.map((i: any) => i.id);

    if (idsToDelete.length > 0) {
      await prisma.paymentInstallment.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }

    // Fetch the updated payment log after deletion
    const updated = await prisma.paymentLog.findUnique({
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

    return NextResponse.json({
      success: true,
      reverted: updated,
    });
  }
  if (action === "UPDATE_INSTALLMENTS") {
    if (!log.paymentLogId) {
      return new NextResponse("Missing paymentLogId for revert", {
        status: 400,
      });
    }

    const oldInst =
      oldValue?.paymentInstallments || oldValue?.installments || [];

    // 1️⃣ Remove current installments
    await prisma.paymentInstallment.deleteMany({
      where: { paymentLogId: log.paymentLogId },
    });

    // 2️⃣ Restore old installments
    if (oldInst.length > 0) {
      await prisma.paymentInstallment.createMany({
        data: oldInst.map((i: any) => ({
          paymentLogId: log.paymentLogId!,
          amount: Number(i.amount),
          paidAt: i.paidAt ? new Date(i.paidAt) : null,
        })),
      });
    }
    // 3️⃣ Fetch restored installments
    const restored = await prisma.paymentInstallment.findMany({
      where: { paymentLogId: log.paymentLogId },
    });

    // 4️⃣ Recalculate totals
    const totalPaid = restored.reduce(
      (sum, inst) => sum + Number(inst.amount || 0),
      0
    );

    const paymentLog = await prisma.paymentLog.findUnique({
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
    await prisma.paymentLog.update({
      where: { id: paymentLog.id },
      data: {
        status: finalStatus,
      },
    });
    // 3️⃣ Fetch updated paymentLog
    const updated = await prisma.paymentLog.findUnique({
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

    return NextResponse.json({
      success: true,
      reverted: updated,
    });
  }

  if (action === "UPDATE") {
    console.log(oldValue, "Old Value in Revert");

    if (!oldValue) {
      return new NextResponse("No previous state to revert", { status: 400 });
    }
    // 1️⃣ Delete current installments
    await prisma.paymentInstallment.deleteMany({
      where: { paymentLogId: log.paymentLogId! },
    });

    // 2️⃣ Prepare old installments
    const oldInstallments: { amount: number; paidAt?: Date | null }[] =
      oldValue.paymentInstallments?.map((i: any) => ({
        amount: Number(i.amount),
        paidAt: i.paidAt ? new Date(i.paidAt) : null,
      })) || [];

    const installmentAction =
      oldInstallments.length > 0
        ? { createMany: { data: oldInstallments } }
        : undefined;

    // 3️⃣ Update paymentLog and restore old installments
    reverted = await prisma.paymentLog.update({
      where: { id: log.paymentLogId! },
      data: {
        ...toPaymentLogUpdateInput(oldValue),
        paymentInstallments: installmentAction,
      },
      include: { paymentInstallments: true },
    });
    await logPaymentChange({
      action: "REVERT",
      paymentLogId: reverted.id,
      oldValue: newValue, // current values
      newValue: oldValue, // restoring values
    });

    return NextResponse.json({ success: true, reverted });
  }

  if (action === "DELETE") {
    if (!oldValue) {
      return new NextResponse("No previous state to recreate", { status: 400 });
    }

    // extract installments from oldValue
    const oldInstallments =
      oldValue.paymentInstallments?.map((i: any) => ({
        amount: Number(i.amount),
        paidAt: i.paidAt ? new Date(i.paidAt) : null,
      })) || [];

    const recreated = await prisma.paymentLog.create({
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

    return NextResponse.json({ success: true, reverted });
  }

  return new NextResponse("Invalid action to revert", { status: 400 });
}
