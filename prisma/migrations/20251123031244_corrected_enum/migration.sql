/*
  Warnings:

  - The values [KESISWAAN] on the enum `staffrole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "staffrole_new" AS ENUM ('PENILAIAN', 'PENJADWALAN', 'ACCOUNTING');
ALTER TABLE "Staff" ALTER COLUMN "staffroles" TYPE "staffrole_new" USING ("staffroles"::text::"staffrole_new");
ALTER TYPE "staffrole" RENAME TO "staffrole_old";
ALTER TYPE "staffrole_new" RENAME TO "staffrole";
DROP TYPE "staffrole_old";
COMMIT;
