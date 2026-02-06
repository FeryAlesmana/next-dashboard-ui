"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import StudentParentTableSkeleton from "../StudentParentTableSkeleton";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const SemesterSelect = dynamic(() => import("../SemesterSelect"), {
  ssr: false,
});
type Semester = {
  label: string;
  start: Date;
  end: Date;
};

export default function StudentLessonViewSemester({
  gradeLevel,
  userId,
  createdAt,
}: {
  userId: string;
  gradeLevel: number; // [{ studentId, gradeLevel }]
  createdAt: any;
}) {
  const [selectedSemesters, setSelectedSemesters] = useState<Semester | null>(
    null,
  );
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [lesson, setLesson] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const generateSemesters = (
    createdAt: Date,
    gradeLevel: number,
  ): Semester[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    // 1. Determine the start of the current Academic Year
    // If we are in Jan-June (0-5), the school year started last year
    const academicYearStart = currentMonth < 6 ? currentYear - 1 : currentYear;

    // 2. Calculate when the student actually started Grade 1
    // If they are in Grade 3 now, they started Grade 1 two years ago
    const studentEntryYear = academicYearStart - (gradeLevel - 1);

    const generated: Semester[] = [];

    // 3. Loop from Entry Year up to the Current Academic Year
    for (let year = studentEntryYear; year <= academicYearStart; year++) {
      // Semester Ganjil (July - Dec)
      generated.push({
        label: `Ganjil ${year}/${year + 1}`,
        start: new Date(`${year}-07-01`),
        end: new Date(`${year}-12-31`),
      });

      // Semester Genap (Jan - June)
      // Only add Genap if the year has actually reached that point
      // Or if it's a past year
      if (year < academicYearStart || currentMonth < 6) {
        generated.push({
          label: `Genap ${year}/${year + 1}`,
          start: new Date(`${year + 1}-01-01`),
          end: new Date(`${year + 1}-06-30`),
        });
      }
    }

    // Filter out semesters that start in the future relative to "now"
    return generated.filter((sem) => sem.start <= now).reverse();
  };
  const fetchLessons = useCallback(async () => {
    if (!selectedSemesters) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/parent-lessons?studentId=${userId}&startDate=${selectedSemesters.start.toISOString()}&endDate=${selectedSemesters.end.toISOString()}`,
      );
      const data = await res.json();

      setLesson(data.lessons || []);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSemesters, userId]);

  useEffect(() => {
    const sems = generateSemesters(createdAt, gradeLevel);
    setSemesters(sems);
    setSelectedSemesters(sems[0]);
  }, [gradeLevel, createdAt]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);
  // console.log(lesson, "lesson in SLV");
  function toNormalCase(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Daftar Pelajaran</h1>

      <div className="mb-4 flex justify-end">
        <SemesterSelect
          semesters={semesters}
          selected={selectedSemesters!}
          onChange={(s) => setSelectedSemesters(s)}
          placeholder="Pilih Semester..."
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-400">
          <StudentParentTableSkeleton />
        </div>
      ) : lesson.length === 0 ? (
        <div className="text-center text-gray-500">
          Tidak ada pelajaran untuk semester ini.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {/* <th className="px-4 py-3 text-left">ID Jadwal</th> */}
                <th className="px-4 py-3 text-left">Mata Pelajaran</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  Kelas
                </th>
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  Mulai
                </th>
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  Berakhir
                </th>
                <th className="px-4 py-3 text-left">Hari</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  Guru
                </th>
                <th className="px-4 py-3 text-center lg:text-left">
                  Pertemuan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {lesson.map((lsn: any) => (
                <tr
                  key={lsn.id}
                  className="even:bg-slate-50 hover:bg-lamaPurpleLight"
                >
                  {/* <td className="p-3">{lsn.id}</td> */}
                  <td className="p-3">{lsn.subject?.name || "-"}</td>
                  <td className="hidden md:table-cell">
                    {lsn.class?.name || "Tidak Ada Kelas"}
                  </td>
                  <td className="p-3 hidden md:table-cell">{lsn.startTime}</td>
                  <td className="p-3 hidden md:table-cell">{lsn.endTime}</td>

                  <td>{toNormalCase(lsn.day)}</td>
                  <td className="hidden md:table-cell">
                    {lsn.teacherId ? `${lsn.teacher?.name}` : "Tidak ada guru"}
                  </td>
                  <td className="text-center lg:text-left ">
                    <Link
                      href={
                        lsn.class
                          ? `/list/attendance/${lsn.class?.name}/${lsn.id}`
                          : "#"
                      }
                    >
                      <button className="w-7 h-7 items-center justify-center rounded-full">
                        <Image
                          src="/moreDark.png"
                          alt=""
                          width={16}
                          height={16}
                        />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
