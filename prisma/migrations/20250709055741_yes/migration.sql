-- AlterTable
ALTER TABLE "PPDB" ADD COLUMN     "dokumenAkte" TEXT,
ADD COLUMN     "dokumenIjazah" TEXT,
ADD COLUMN     "dokumenKKKTP" TEXT,
ADD COLUMN     "dokumenPasfoto" TEXT;

-- AlterTable
ALTER TABLE "student_details" ADD COLUMN     "dokumenAkte" TEXT,
ADD COLUMN     "dokumenIjazah" TEXT,
ADD COLUMN     "dokumenKKKTP" TEXT,
ADD COLUMN     "dokumenPasfoto" TEXT;
