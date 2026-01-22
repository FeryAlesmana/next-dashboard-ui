import { PaymentLog, PaymentInstallment, PaymentType, PaymentStatus } from "@prisma/client";

export type PaymentSnapshot = {
  paymentLog: {
    id: number;
    studentId: string;
    amount: number;
    paymentType: PaymentType;
    status: PaymentStatus;
    dueDate: string;
    paidAt?: string | null;
    description?: string | null;
    paymentMethod?: string | null;
    receiptNumber?: string | null;
    classId?: number | null;
    gradeId?: number | null;
  };
  installments: {
    amount: number;
    paidAt?: string | null;
  }[];
};

export function snapshotPayment(
  log: PaymentLog & { paymentInstallments?: PaymentInstallment[] }
): PaymentSnapshot {
  return {
    paymentLog: {
      id: log.id,
      studentId: log.studentId,
      amount: Number(log.amount),
      paymentType: log.paymentType,
      status: log.status,
      dueDate: log.dueDate.toISOString(),
      paidAt: log.paidAt?.toISOString() ?? null,
      description: log.description ?? null,
      paymentMethod: log.paymentMethod ?? null,
      receiptNumber: log.receiptNumber ?? null,
      classId: log.classId ?? null,
      gradeId: log.gradeId ?? null,
    },
    installments:
      log.paymentInstallments?.map((i) => ({
        amount: Number(i.amount),
        paidAt: i.paidAt?.toISOString() ?? null,
      })) ?? [],
  };
}
