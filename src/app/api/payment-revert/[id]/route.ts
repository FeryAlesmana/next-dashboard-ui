import {
  createBill,
  createPayment,
  CurrentState,
  deletePaymentLog,
  updateBill,
  updatePayment,
} from "@/lib/actions";
import { logPaymentChange } from "@/lib/paymentLogChange";
import { PaymentSnapshot } from "@/lib/paymentSnapshot";
import prisma from "@/lib/prisma";
import { toPaymentLogUpdateInput } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { ChangeAction, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};
type RevertContext = {
  log: any;
  oldValue: any;
  newValue: any;
};

async function restoreSnapshot(snapshot: PaymentSnapshot) {
  await prisma.$transaction(async (tx) => {
    // 1. Restore bill
    await tx.paymentLog.upsert({
      where: { id: snapshot.paymentLog.id },
      create: {
        ...snapshot.paymentLog,
        amount: snapshot.paymentLog.amount,
        dueDate: new Date(snapshot.paymentLog.dueDate),
        paidAt: snapshot.paymentLog.paidAt
          ? new Date(snapshot.paymentLog.paidAt)
          : null,
      },
      update: {
        ...snapshot.paymentLog,
        amount: snapshot.paymentLog.amount,
        dueDate: new Date(snapshot.paymentLog.dueDate),
        paidAt: snapshot.paymentLog.paidAt
          ? new Date(snapshot.paymentLog.paidAt)
          : null,
      },
    });

    // 2. Reset payments
    await tx.paymentInstallment.deleteMany({
      where: { paymentLogId: snapshot.paymentLog.id },
    });

    // 3. Restore payments
    if (snapshot.installments.length > 0) {
      await tx.paymentInstallment.createMany({
        data: snapshot.installments.map((i) => ({
          paymentLogId: snapshot.paymentLog.id,
          amount: i.amount,
          paidAt: i.paidAt ? new Date(i.paidAt) : null,
        })),
      });
    }
  });
}

const REVERT_ACTION_MAP: Record<string, (ctx: RevertContext) => Promise<void>> =
  {
    CREATE_BILL: async ({ log }) => {
      await prisma.paymentLog.delete({
        where: { id: log.paymentLogId },
      });
    },

    UPDATE_BILL: async ({ oldValue }) => {
      await restoreSnapshot(oldValue);
    },

    DELETE_BILL: async ({ oldValue }) => {
      await restoreSnapshot(oldValue);
    },

    CREATE_PAYMENTS: async ({ log }) => {
      await prisma.paymentLog.delete({
        where: { id: log.paymentLogId },
      });
    },

    UPDATE_PAYMENTS: async ({ oldValue }) => {
      await restoreSnapshot(oldValue);
    },

    DELETE_PAYMENTS: async ({ oldValue }) => {
      await restoreSnapshot(oldValue);
    },
    // ✅ REVERT is reversible by swapping values
    REVERT: async ({ newValue }) => {
      await restoreSnapshot(newValue);
    },
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

  let reverted = false;
  let dAction: ChangeAction = "REVERT";

  if (log?.action === "REVERT") {
    reverted = true;
    dAction = "UNREVERT";
  }

  if (!log) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // ❌ Don't allow reverting the same change twice
  const alreadyReverted = await prisma.paymentLogChange.findFirst({
    where: {
      revertedFromId: log.id,
    },
  });
  if (log.isReverted) {
    return new NextResponse("This change has already been reverted", {
      status: 400,
    });
  }
  if (alreadyReverted) {
    return new NextResponse("This change has already been reverted", {
      status: 400,
    });
  }

  const handler = REVERT_ACTION_MAP[log.action];
  await prisma.paymentLogChange.update({
    where: { id: log.id },
    data: { isReverted: true },
  });

  if (!handler) {
    return new NextResponse("Action not revertible", { status: 400 });
  }

  try {
    // ✅ Perform revert
    await handler({
      log,
      oldValue: log.oldValue,
      newValue: log.newValue,
    });

    // ✅ Mark revert in changelog
    await logPaymentChange({
      action: dAction,
      paymentLogId: log.paymentLogId ?? undefined,
      oldValue: log.newValue,
      newValue: log.oldValue,
      revertedFromId: log.id, // 👈 CRITICAL
      isReverted: reverted,
    });

    return NextResponse.json({
      success: true,
      revertedPaymentLogId: log.paymentLogId,
    });
  } catch (err) {
    console.error("REVERT FAILED:", err);
    return NextResponse.json(
      { success: false, error: "REVERT_FAILED" },
      { status: 500 },
    );
  }
}
