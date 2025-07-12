/*
  Warnings:

  - Added the required column `sex` to the `Parent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "sex" "UserSex" NOT NULL;
