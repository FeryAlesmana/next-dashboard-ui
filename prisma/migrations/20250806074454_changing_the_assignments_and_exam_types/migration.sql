/*
  Warnings:

  - The `resultType` column on the `Result` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "exTypes" AS ENUM ('UJIAN_HARIAN', 'UJIAN_TENGAH_SEMESTER', 'UJIAN_AKHIR_SEMESTER');

-- CreateEnum
CREATE TYPE "assTypes" AS ENUM ('PEKERJAAN_RUMAH', 'TUGAS_AKHIR', 'TUGAS_HARIAN');

-- CreateEnum
CREATE TYPE "resTypes" AS ENUM ('TUGAS_HARIAN', 'TUGAS_AKHIR', 'PEKERJAAN_RUMAH', 'UJIAN_HARIAN', 'UJIAN_TENGAH_SEMESTER', 'UJIAN_AKHIR_SEMESTER');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "assType" "assTypes";

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "exType" "exTypes";

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "resultType",
ADD COLUMN     "resultType" "resTypes";

-- DropEnum
DROP TYPE "RESULT";
