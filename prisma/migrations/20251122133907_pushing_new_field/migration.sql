-- CreateEnum
CREATE TYPE "staffrole" AS ENUM ('PENJADWALAN', 'ACCOUNTING');

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "staffroles" "staffrole";
