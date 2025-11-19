import prisma from "@/lib/prisma";
import { logPaymentChange } from "@/lib/paymentLogChange";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const user = await currentUser();
  if (user?.publicMetadata.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const { ids } = await req.json();
  if (!ids || !Array.isArray(ids)) {
    return new Response("Invalid request", { status: 400 });
  }

  for (const id of ids) {
    const log = await prisma.paymentLogChange.findUnique({
      where: { id },
    });

    if (!log) continue;

    if (!log.oldValue) {
      // No snapshot to revert
      continue;
    }

    // Convert snapshot into clean Prisma update input
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

    const revertData: any = {};
    for (const key in log.oldValue as any) {
      if (key in allowedFields) {
        revertData[key] = (log.oldValue as any)[key];
      }
    }

    // Perform revert
    const reverted = await prisma.paymentLog.update({
      where: { id: log.paymentLogId! },
      data: revertData,
    });

    // Log the revert
    await logPaymentChange({
      action: "REVERT",
      paymentLogId: reverted.id,
      oldValue: log.newValue,
      newValue: log.oldValue,
    });
  }

  return Response.json({ success: true });
}
