import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { sanitizePaymentLogSnapshot } from "./utils";
import { Prisma } from "@prisma/client";

export async function logPaymentChange({
  paymentLogId,
  action,
  oldValue,
  newValue,
}: {
  paymentLogId?: number;
  action: "CREATE" | "UPDATE" | "DELETE" | "REVERT";
  oldValue?: any;
  newValue?: any;
}) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  await prisma.paymentLogChange.create({
    data: {
      paymentLogId,
      action,
      oldValue: oldValue
        ? sanitizePaymentLogSnapshot(oldValue)
        : Prisma.JsonNull,
      newValue: newValue
        ? sanitizePaymentLogSnapshot(newValue)
        : Prisma.JsonNull,
      changedById: user?.id || "unknown",
      changedByName: user?.username || user?.firstName || "Unknown User",
      changedByRole: role || "unknown",
    },
  });
}
