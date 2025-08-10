/*
  Warnings:

  - The values [Kriten] on the enum `Agama` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Agama_new" AS ENUM ('Islam', 'Kristen', 'Buddha', 'Lainnya');
ALTER TABLE "Student" ALTER COLUMN "religion" TYPE "Agama_new" USING ("religion"::text::"Agama_new");
ALTER TABLE "Teacher" ALTER COLUMN "religion" TYPE "Agama_new" USING ("religion"::text::"Agama_new");
ALTER TABLE "PPDB" ALTER COLUMN "religion" TYPE "Agama_new" USING ("religion"::text::"Agama_new");
ALTER TYPE "Agama" RENAME TO "Agama_old";
ALTER TYPE "Agama_new" RENAME TO "Agama";
DROP TYPE "Agama_old";
COMMIT;
