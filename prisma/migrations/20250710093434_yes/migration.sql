-- AlterTable
ALTER TABLE "PPDB" ALTER COLUMN "no_kps" DROP NOT NULL,
ALTER COLUMN "awards" DROP NOT NULL,
ALTER COLUMN "awards_date" DROP NOT NULL,
ALTER COLUMN "scholarship" DROP NOT NULL,
ALTER COLUMN "scholarship_detail" DROP NOT NULL,
ALTER COLUMN "scholarship_date" DROP NOT NULL,
ALTER COLUMN "kps" DROP NOT NULL,
ALTER COLUMN "awards_lvl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "guardianId" TEXT,
ADD COLUMN     "secondParentId" TEXT;

-- AlterTable
ALTER TABLE "student_details" ALTER COLUMN "no_kps" DROP NOT NULL,
ALTER COLUMN "awards" DROP NOT NULL,
ALTER COLUMN "awards_date" DROP NOT NULL,
ALTER COLUMN "scholarship" DROP NOT NULL,
ALTER COLUMN "scholarship_detail" DROP NOT NULL,
ALTER COLUMN "kps" DROP NOT NULL,
ALTER COLUMN "awards_lvl" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_secondParentId_fkey" FOREIGN KEY ("secondParentId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
