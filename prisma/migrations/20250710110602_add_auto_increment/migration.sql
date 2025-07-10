/*
  Warnings:

  - You are about to drop the column `father_degree` on the `PPDB` table. All the data in the column will be lost.
  - You are about to drop the column `guardian_degree` on the `PPDB` table. All the data in the column will be lost.
  - You are about to drop the column `mother_degree` on the `PPDB` table. All the data in the column will be lost.

*/
-- AlterTable
CREATE SEQUENCE ppdb_id_seq;
ALTER TABLE "PPDB" DROP COLUMN "father_degree",
DROP COLUMN "guardian_degree",
DROP COLUMN "mother_degree",
ALTER COLUMN "id" SET DEFAULT nextval('ppdb_id_seq');
ALTER SEQUENCE ppdb_id_seq OWNED BY "PPDB"."id";
