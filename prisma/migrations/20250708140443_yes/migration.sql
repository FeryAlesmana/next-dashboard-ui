/*
  Warnings:

  - Added the required column `father_degree` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guardian_degree` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mother_degree` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `awards_lvl` on the `PPDB` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `degree` on the `Parent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `awards_lvl` on the `student_details` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Awards" AS ENUM ('kecamatan', 'kota', 'kabupaten', 'provinsi', 'nasional', 'internasional');

-- CreateEnum
CREATE TYPE "Degree" AS ENUM ('TIDAK_ADA', 'SD', 'SMP', 'SMA', 'D3', 'S1', 'S2', 'S3');

-- AlterTable
ALTER TABLE "PPDB" ADD COLUMN     "father_degree" "Degree" NOT NULL,
ADD COLUMN     "guardian_degree" "Degree" NOT NULL,
ADD COLUMN     "mother_degree" "Degree" NOT NULL,
DROP COLUMN "awards_lvl",
ADD COLUMN     "awards_lvl" "Awards" NOT NULL;

-- AlterTable
ALTER TABLE "Parent" DROP COLUMN "degree",
ADD COLUMN     "degree" "Degree" NOT NULL;

-- AlterTable
ALTER TABLE "student_details" DROP COLUMN "awards_lvl",
ADD COLUMN     "awards_lvl" "Awards" NOT NULL;
