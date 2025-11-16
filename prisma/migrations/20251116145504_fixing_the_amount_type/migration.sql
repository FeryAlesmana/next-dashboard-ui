/*
  Warnings:

  - You are about to alter the column `amount` on the `PaymentInstallment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `PaymentLog` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "PaymentInstallment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "PaymentLog" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);
