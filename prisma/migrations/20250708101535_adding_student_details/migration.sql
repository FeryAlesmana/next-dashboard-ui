/*
  Warnings:

  - Added the required column `degree` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `income` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `religion` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `religion` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Agama" AS ENUM ('Islam', 'Kriten', 'Buddha', 'Lainnya');

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_classId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_classId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_gradeId_fkey";

-- AlterTable
ALTER TABLE "Assignment" ALTER COLUMN "lessonId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "studentId" DROP NOT NULL,
ALTER COLUMN "lessonId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Class" ALTER COLUMN "gradeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "lessonId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "subjectId" DROP NOT NULL,
ALTER COLUMN "classId" DROP NOT NULL,
ALTER COLUMN "teacherId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "degree" TEXT NOT NULL,
ADD COLUMN     "income" INTEGER NOT NULL,
ADD COLUMN     "job" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Result" ALTER COLUMN "studentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "religion" "Agama" NOT NULL,
ALTER COLUMN "classId" DROP NOT NULL,
ALTER COLUMN "gradeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "religion" "Agama" NOT NULL;

-- CreateTable
CREATE TABLE "student_details" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "nisn" INTEGER NOT NULL,
    "npsn" INTEGER NOT NULL,
    "no_ijz" INTEGER NOT NULL,
    "nik" INTEGER NOT NULL,
    "no_kps" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "distance_from_home" INTEGER NOT NULL,
    "time_from_home" INTEGER NOT NULL,
    "number_of_siblings" INTEGER NOT NULL,
    "postcode" INTEGER NOT NULL,
    "awards" TEXT NOT NULL,
    "awards_lvl" TEXT NOT NULL,
    "awards_date" TIMESTAMP(3) NOT NULL,
    "scholarship" TEXT NOT NULL,
    "scholarship_detail" TEXT NOT NULL,

    CONSTRAINT "student_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PPDB" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "sex" "UserSex" NOT NULL,
    "religion" "Agama" NOT NULL,
    "email" TEXT,
    "nisn" INTEGER NOT NULL,
    "npsn" INTEGER NOT NULL,
    "no_ijz" INTEGER NOT NULL,
    "nik" INTEGER NOT NULL,
    "no_kps" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "distance_from_home" INTEGER NOT NULL,
    "time_from_home" INTEGER NOT NULL,
    "number_of_siblings" INTEGER NOT NULL,
    "postcode" INTEGER NOT NULL,
    "awards" TEXT NOT NULL,
    "awards_lvl" TEXT NOT NULL,
    "awards_date" TIMESTAMP(3) NOT NULL,
    "scholarship" TEXT NOT NULL,
    "scholarship_detail" TEXT NOT NULL,
    "scholarship_date" TIMESTAMP(3) NOT NULL,
    "isvalid" BOOLEAN NOT NULL,

    CONSTRAINT "PPDB_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_details_studentId_key" ON "student_details"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_details_nisn_key" ON "student_details"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "student_details_npsn_key" ON "student_details"("npsn");

-- CreateIndex
CREATE UNIQUE INDEX "student_details_no_ijz_key" ON "student_details"("no_ijz");

-- CreateIndex
CREATE UNIQUE INDEX "student_details_nik_key" ON "student_details"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "student_details_no_kps_key" ON "student_details"("no_kps");

-- CreateIndex
CREATE UNIQUE INDEX "PPDB_phone_key" ON "PPDB"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "PPDB_email_key" ON "PPDB"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PPDB_nisn_key" ON "PPDB"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "PPDB_npsn_key" ON "PPDB"("npsn");

-- CreateIndex
CREATE UNIQUE INDEX "PPDB_no_ijz_key" ON "PPDB"("no_ijz");

-- CreateIndex
CREATE UNIQUE INDEX "PPDB_nik_key" ON "PPDB"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "PPDB_no_kps_key" ON "PPDB"("no_kps");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_details" ADD CONSTRAINT "student_details_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
