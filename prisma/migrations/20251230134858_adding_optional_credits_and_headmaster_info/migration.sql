-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ChangeAction" ADD VALUE 'CREATE_INSTALLMENTS';
ALTER TYPE "ChangeAction" ADD VALUE 'UPDATE_INSTALLMENTS';

-- AlterTable
ALTER TABLE "PaymentLogChange" ADD COLUMN     "installmentId" INTEGER;

-- CreateTable
CREATE TABLE "HomeSetting" (
    "id" SERIAL NOT NULL,
    "show" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentLogChange" ADD CONSTRAINT "PaymentLogChange_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "PaymentInstallment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
