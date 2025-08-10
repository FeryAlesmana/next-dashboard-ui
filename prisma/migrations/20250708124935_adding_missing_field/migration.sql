/*
  Warnings:

  - Added the required column `kps` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tempat_tinggal` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transportation` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kps` to the `student_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tempat_tinggal` to the `student_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transportation` to the `student_details` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "KPS" AS ENUM ('KIP', 'KIS', 'KKS');

-- CreateEnum
CREATE TYPE "TTinggal" AS ENUM ('Orang_Tua', 'Wali', 'Kost', 'Asrama', 'Pesantren');

-- AlterTable
ALTER TABLE "PPDB" ADD COLUMN     "kps" "KPS" NOT NULL,
ADD COLUMN     "tempat_tinggal" "TTinggal" NOT NULL,
ADD COLUMN     "transportation" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "student_details" ADD COLUMN     "kps" "KPS" NOT NULL,
ADD COLUMN     "tempat_tinggal" "TTinggal" NOT NULL,
ADD COLUMN     "transportation" TEXT NOT NULL;
