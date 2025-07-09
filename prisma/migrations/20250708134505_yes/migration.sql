/*
  Warnings:

  - Added the required column `birthPlace` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthday` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthPlace` to the `student_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PPDB" ADD COLUMN     "birthPlace" TEXT NOT NULL,
ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "student_details" ADD COLUMN     "birthPlace" TEXT NOT NULL;
