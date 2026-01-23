// app/api/installments/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logPaymentChange } from "@/lib/paymentLogChange";
import { PaymentStatus } from "@prisma/client";
import { snapshotPayment } from "@/lib/paymentSnapshot";

function safeNumber(val: any) {
  return val && typeof val === "object" && typeof val.toNumber === "function"
    ? val.toNumber()
    : Number(val);
}
type Params = {
  params: Promise<{
    id: string;
  }>;
};
export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  const installmentId = Number(id);
  if (!installmentId || isNaN(installmentId)) {
    return NextResponse.json(
      { success: false, error: true, message: "Invalid installment id" },
      { status: 400 },
    );
  }

  try {
    const inst = await prisma.paymentInstallment.findUnique({
      where: { id: installmentId },
    });
    if (!inst) {
      return NextResponse.json(
        { success: false, error: true, message: "Installment not found" },
        { status: 404 },
      );
    }

    const paymentLogId = inst.paymentLogId;

    const logs = await prisma.paymentLog.findUnique({
      where: { id: paymentLogId },
    });
    if (!logs) {
      return NextResponse.json(
        { success: false, error: true, message: "Log not found" },
        { status: 404 },
      );
    }
    // Snapshot BEFORE deletion
    const oldValue = {
      ...logs,
      paymentInstallments: inst,
    };

    const before = await prisma.paymentLog.findUnique({
      where: { id: paymentLogId },
      include: { paymentInstallments: true },
    });

    await logPaymentChange({
      action: "DELETE_PAYMENTS",
      paymentLogId: logs.id,
      oldValue: snapshotPayment(before!), // ✅ SCHEMA SHAPE
      newValue: null,
      isReverted: false
    });

    await prisma.paymentInstallment.delete({ where: { id: installmentId } });

    const remaining = await prisma.paymentInstallment.findMany({
      where: { paymentLogId },
      orderBy: { createdAt: "asc" },
    });

    // 6️⃣ Recalculate totalPaid
    const totalPaid = remaining.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    // 7️⃣ Determine new payment status
    let finalStatus: PaymentStatus = "PENDING";

    if (totalPaid >= Number(logs.amount)) {
      finalStatus = "PAID";
    } else if (totalPaid > 0) {
      finalStatus = "PARTIALLY_PAID";
    }

    // 8️⃣ Update paymentLog with new status + totalPaid
    const updatedPaymentLog = await prisma.paymentLog.update({
      where: { id: paymentLogId },
      data: {
        status: finalStatus,
      },
    });

    // // 9️⃣ NEW SNAPSHOT
    // const newValue = {
    //   ...updatedPaymentLog,
    //   paymentInstallments: remaining,
    // };

    // await logPaymentChange({
    //   action: "UPDATE_PAYMENTS",
    //   paymentLogId,
    //   oldValue: oldValue,
    //   newValue: newValue,
    // });

    const mapped = remaining.map((u) => ({
      id: u.id,
      amount: safeNumber(u.amount),
      paidAt: u.paidAt ? u.paidAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      error: false,
      message: "Installment deleted",
      data: { paymentLogId, installments: mapped },
    });
  } catch (err) {
    console.error("Delete installment error:", err);
    return NextResponse.json(
      { success: false, error: true, message: "Server error" },
      { status: 500 },
    );
  }
}
