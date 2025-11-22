/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Staff` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `Staff` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthday` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kecamatan` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kelurahan` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kota` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `religion` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rt` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rw` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "img" TEXT,
ADD COLUMN     "kecamatan" TEXT NOT NULL,
ADD COLUMN     "kelurahan" TEXT NOT NULL,
ADD COLUMN     "kota" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "religion" "Agama" NOT NULL,
ADD COLUMN     "rt" TEXT NOT NULL,
ADD COLUMN     "rw" TEXT NOT NULL,
ADD COLUMN     "sex" "UserSex" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_phone_key" ON "Staff"("phone");
