/*
  Warnings:

  - You are about to drop the column `namalengkap` on the `PPDB` table. All the data in the column will be lost.
  - You are about to drop the column `namalengkap` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `namalengkap` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `namalengkap` on the `Teacher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PPDB" DROP COLUMN "namalengkap";

-- AlterTable
ALTER TABLE "Parent" DROP COLUMN "namalengkap";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "namalengkap";

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "namalengkap";
