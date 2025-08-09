/*
  Warnings:

  - You are about to drop the column `surname` on the `PPDB` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `Teacher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[password]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[password]` on the table `Parent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[password]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[password]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namalengkap` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namalengkap` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namalengkap` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namalengkap` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PPDB" DROP COLUMN "surname",
ADD COLUMN     "namalengkap" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Parent" DROP COLUMN "surname",
ADD COLUMN     "namalengkap" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "surname",
ADD COLUMN     "namalengkap" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "surname",
ADD COLUMN     "namalengkap" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_password_key" ON "Admin"("password");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_password_key" ON "Parent"("password");

-- CreateIndex
CREATE UNIQUE INDEX "Student_password_key" ON "Student"("password");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_password_key" ON "Teacher"("password");
