import { logPaymentChange } from "@/lib/paymentLogChange";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
type Params = {
  params: Promise<{
    id: number;
  }>;
};
export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const changeId = Number(id);
  const user = await currentUser();

  if (user?.publicMetadata.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const log = await prisma.paymentLogChange.findUnique({
    where: { id: changeId },
  });

  if (!log) return new Response("Not Found", { status: 404 });
  const action = log.action;
  const oldValue = log.oldValue as any;
  const newValue = log.newValue as any;
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
      if (key in allowedFields) {
        cleaned[key as keyof typeof allowedFields] = snapshot[key];
      }
    }

    return cleaned;
  }

  let reverted: any = null;

  // ----------------------------------------
  //  CASE 1: REVERTING A "CREATE"
  //  -> Delete the payment log entirely
  // ----------------------------------------
  if (action === "CREATE") {
    if (!log.paymentLogId) {
      return new Response("Missing paymentLogId for revert", { status: 400 });
    }

    reverted = await prisma.paymentLog.delete({
      where: { id: log.paymentLogId },
    });

    await logPaymentChange({
      action: "REVERT",
      oldValue: newValue, // value that was created
      newValue: null,
    });

    return Response.json({ success: true, reverted });
  }
  if (action === "UPDATE") {
    console.log(oldValue, "Old Value in Revert");

    if (!oldValue) {
      return new Response("No previous state to revert", { status: 400 });
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

    return Response.json({ success: true, reverted });
  }

  if (action === "DELETE") {
    if (!oldValue) {
      return new Response("No previous state to recreate", { status: 400 });
    }

    const recreated = await prisma.paymentLog.create({
      data: toPaymentLogUpdateInput(oldValue),
    });

    reverted = recreated;

    await logPaymentChange({
      action: "REVERT",
      paymentLogId: recreated.id,
      oldValue: null,
      newValue: oldValue,
    });

    return Response.json({ success: true, reverted });
  }

  return new Response("Invalid action to revert", { status: 400 });
}
