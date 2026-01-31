import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  getCurrentStaff,
  getCurrentUser,
  sanitizePaymentLogSnapshot,
} from "./utils";
import { ChangeAction, Prisma, staffrole } from "@prisma/client";

// logPaymentChange.ts

export async function logPaymentChange({
  action,
  paymentLogId,
  oldValue,
  newValue,
  installmentId,
  revertedFromId,
  isReverted,
}: {
  action: ChangeAction;
  paymentLogId?: number;
  revertedFromId?: number;
  installmentId?: number | null;
  oldValue: any;
  newValue: any;
  isReverted: boolean;
}) {
  const user = await currentUser();
  const { role, userId } = await getCurrentUser();

  let finalRole: "ADMIN" | "ACCOUNTING";

  if (role === "admin") {
    finalRole = "ADMIN";
  } else if (role === "staff") {
    const staffrole = await getCurrentStaff(userId!);

    if (staffrole !== "ACCOUNTING") {
      throw new Error("Unauthorized staff role");
    }

    finalRole = "ACCOUNTING";
  } else {
    throw new Error("Unauthorized role");
  }
  // console.log(paymentLogId, "= Payment log id in logpaymentChange");
  // console.log(isReverted, "= isReverted in logpaymentChange");
  // console.log(revertedFromId, "= revertedFromId in logpaymentChange");

  // Clean installments for logging
  const oldSnapshot = oldValue || null;

  const newSnapshot = newValue || null;

  return prisma.paymentLogChange.create({
    data: {
      action,
      paymentLogId: paymentLogId,
      plogId: paymentLogId,
      installmentId: installmentId,
      isReverted: isReverted,
      revertedFromId: revertedFromId,
      oldValue: oldSnapshot,
      newValue: newSnapshot,
      changedById: user?.id || "unknown",
      changedByName: user?.username || user?.firstName || "Unknown User",
      changedByRole: finalRole,
    },
  });
}
