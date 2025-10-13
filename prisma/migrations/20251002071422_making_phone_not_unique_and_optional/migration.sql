-- DropIndex
DROP INDEX "Parent_phone_key";

-- DropIndex
DROP INDEX "Student_phone_key";

-- AlterTable
ALTER TABLE "Parent" ALTER COLUMN "phone" DROP NOT NULL;
