/*
  Warnings:

  - Added the required column `namaAyah` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namaIbu` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namaWali` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pekerjaanAyah` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pekerjaanIbu` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pekerjaanWali` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pendidikanAyah` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pendidikanIbu` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pendidikanWali` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penghasilanAyah` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penghasilanIbu` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penghasilanWali` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tahunLahirAyah` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tahunLahirIbu` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tahunLahirWali` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telpAyah` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telpIbu` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telpWali` to the `PPDB` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthday` to the `Parent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PPDB" ADD COLUMN     "namaAyah" TEXT NOT NULL,
ADD COLUMN     "namaIbu" TEXT NOT NULL,
ADD COLUMN     "namaWali" TEXT NOT NULL,
ADD COLUMN     "pekerjaanAyah" TEXT NOT NULL,
ADD COLUMN     "pekerjaanIbu" TEXT NOT NULL,
ADD COLUMN     "pekerjaanWali" TEXT NOT NULL,
ADD COLUMN     "pendidikanAyah" "Degree" NOT NULL,
ADD COLUMN     "pendidikanIbu" "Degree" NOT NULL,
ADD COLUMN     "pendidikanWali" "Degree" NOT NULL,
ADD COLUMN     "penghasilanAyah" INTEGER NOT NULL,
ADD COLUMN     "penghasilanIbu" INTEGER NOT NULL,
ADD COLUMN     "penghasilanWali" INTEGER NOT NULL,
ADD COLUMN     "tahunLahirAyah" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tahunLahirIbu" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tahunLahirWali" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "telpAyah" TEXT NOT NULL,
ADD COLUMN     "telpIbu" TEXT NOT NULL,
ADD COLUMN     "telpWali" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL;
