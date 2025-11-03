/*
  Warnings:

  - You are about to drop the column `gradeId` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_gradeId_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "gradeId";
