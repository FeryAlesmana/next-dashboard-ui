/*
  Warnings:

  - Added the required column `kecamatan` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kelurahan` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kota` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rt` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rw` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kecamatan` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kelurahan` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kota` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rt` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rw` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kecamatan` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kelurahan` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kota` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rt` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rw` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PPDB" ADD COLUMN     "kecamatan" TEXT NOT NULL,
ADD COLUMN     "kelurahan" TEXT NOT NULL,
ADD COLUMN     "kota" TEXT NOT NULL,
ADD COLUMN     "rt" TEXT NOT NULL,
ADD COLUMN     "rw" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "kecamatan" TEXT NOT NULL,
ADD COLUMN     "kelurahan" TEXT NOT NULL,
ADD COLUMN     "kota" TEXT NOT NULL,
ADD COLUMN     "rt" TEXT NOT NULL,
ADD COLUMN     "rw" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "kecamatan" TEXT NOT NULL,
ADD COLUMN     "kelurahan" TEXT NOT NULL,
ADD COLUMN     "kota" TEXT NOT NULL,
ADD COLUMN     "rt" TEXT NOT NULL,
ADD COLUMN     "rw" TEXT NOT NULL;
