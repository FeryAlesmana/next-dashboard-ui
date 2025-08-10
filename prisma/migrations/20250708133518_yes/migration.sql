/*
  Warnings:

  - Added the required column `asalSekolah` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `asalSekolah` to the `student_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PPDB" ADD COLUMN     "asalSekolah" TEXT NOT NULL,
ALTER COLUMN "nisn" SET DATA TYPE TEXT,
ALTER COLUMN "npsn" SET DATA TYPE TEXT,
ALTER COLUMN "no_ijz" SET DATA TYPE TEXT,
ALTER COLUMN "nik" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "student_details" ADD COLUMN     "asalSekolah" TEXT NOT NULL,
ALTER COLUMN "nisn" SET DATA TYPE TEXT,
ALTER COLUMN "npsn" SET DATA TYPE TEXT,
ALTER COLUMN "no_ijz" SET DATA TYPE TEXT,
ALTER COLUMN "nik" SET DATA TYPE TEXT;
