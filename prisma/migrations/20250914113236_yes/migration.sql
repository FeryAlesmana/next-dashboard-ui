/*
  Warnings:

  - You are about to drop the column `subtitle` on the `HeroSlide` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `HeroSlide` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HeroSlide" DROP COLUMN "subtitle",
DROP COLUMN "title";
