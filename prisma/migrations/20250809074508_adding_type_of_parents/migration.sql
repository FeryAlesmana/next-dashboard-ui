-- CreateEnum
CREATE TYPE "parents" AS ENUM ('AYAH', 'IBU', 'WALI');

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "waliMurid" "parents";
