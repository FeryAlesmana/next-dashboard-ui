-- CreateEnum
CREATE TYPE "ChangeAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'REVERT');

-- CreateTable
CREATE TABLE "PaymentLogChange" (
    "id" SERIAL NOT NULL,
    "paymentLogId" INTEGER,
    "action" "ChangeAction" NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changedById" TEXT NOT NULL,
    "changedByName" TEXT NOT NULL,
    "changedByRole" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLogChange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentLogChange" ADD CONSTRAINT "PaymentLogChange_paymentLogId_fkey" FOREIGN KEY ("paymentLogId") REFERENCES "PaymentLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
