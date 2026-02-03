"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SemesterSelect from "../SemesterSelect";
import StudentParentTableSkeleton from "../StudentParentTableSkeleton";
import Link from "next/link";
import Image from "next/image";

type Semester = {
  label: string;
  start: Date;
  end: Date;
};

export default function ParentLessonViewSemester({
  gradeLevel,
  userId,
}: {
  userId: string;
  gradeLevel: any[]; // [{ studentId, gradeLevel }]
}) {
  const [selectedSemesters, setSelectedSemesters] = useState<{
    [studentId: string]: Semester;
  }>({});
  const [studentsWithLessons, setStudentsWithLessons] = useState<any[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadingMap, setLoadingMap] = useState<{
    [studentId: string]: boolean;
  }>({});

  const lessonsCache = useRef<{ [key: string]: any[] }>({});

  const generateSemesters = (
    createdAt: Date,
    gradeLevel: number
  ): Semester[] => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Start from either enrollment year OR calculated grade start year
    const startYear = Math.min(
      createdAt.getFullYear(),
      currentYear - (gradeLevel - 1)
    );

    const graduationYear = startYear + (gradeLevel - 1);
    const generated: Semester[] = [];
    const limitStart = Math.max(startYear, currentYear - 2);
    const limitEnd = Math.min(graduationYear, currentYear);

    for (let year = limitStart; year <= limitEnd; year++) {
      generated.push({
        label: `Ganjil ${year}/${year + 1}`,
        start: new Date(`${year}-07-01`),
        end: new Date(`${year}-12-31`),
      });
      generated.push({
        label: `Genap ${year}/${year + 1}`,
        start: new Date(`${year + 1}-01-01`),
        end: new Date(`${year + 1}-06-30`),
      });
    }

    return generated.reverse();
  };

  const fetchLessons = useCallback(
    async (studentId: string, semester: Semester) => {
      const cacheKey = `${studentId}_${semester.label}`;
      if (lessonsCache.current[cacheKey]) {
        setStudentsWithLessons((prev) => {
          const other = prev.filter((p) => p.id !== studentId);
          return [...other, { ...lessonsCache.current[cacheKey] }];
        });
        return;
      }

      setLoadingMap((prev) => ({ ...prev, [studentId]: true }));

      try {
        const res = await fetch(
          `/api/parent-lessons?studentId=${studentId}&startDate=${semester.start.toISOString()}&endDate=${semester.end.toISOString()}`
        );
        const lessons = await res.json();

        const studentData = { ...lessons, id: studentId };

        lessonsCache.current[cacheKey] = studentData;

        setStudentsWithLessons((prev) => {
          const other = prev.filter((p) => p.id !== studentId);
          return [...other, studentData];
        });
      } catch (err) {
        console.error("Error fetching lessons:", err);
      } finally {
        setLoadingMap((prev) => ({ ...prev, [studentId]: false }));
      }
    },
    []
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("selectedSemesters");
    const parsed = stored ? JSON.parse(stored) : {};

    const initialSemesters: { [studentId: string]: Semester } = {};

    gradeLevel.forEach(({ studentId, gradeLevel, createdAt }) => {
      const semesters = generateSemesters(createdAt, gradeLevel);
      const savedLabel = parsed?.[studentId]?.label;

      const matchedSemester = semesters.find((s) => s.label === savedLabel);
      const selected = matchedSemester || semesters[0];

      initialSemesters[studentId] = selected;
      fetchLessons(studentId, selected);
    });

    setSelectedSemesters(initialSemesters);
  }, [gradeLevel, fetchLessons]);

  const handleSemesterChange = (studentId: string, semester: Semester) => {
    const updated = { ...selectedSemesters, [studentId]: semester };
    setSelectedSemesters(updated);
    localStorage.setItem("selectedSemesters", JSON.stringify(updated));
    fetchLessons(studentId, semester);
  };

  if (!hydrated) return null;

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Daftar Pelajaran</h1>

      {gradeLevel.map(({ studentId, gradeLevel: gLevel, createdAt }) => {
        const student = studentsWithLessons.find((s) => s.id === studentId);
        const semester = selectedSemesters[studentId];
        const semesters = generateSemesters(createdAt, gLevel);
        const isLoading = loadingMap[studentId];

        return (
          <div key={studentId} className="mb-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2">
              {/* Name (truncate) */}
              <h2
                className="text-xl font-semibold max-w-full md:max-w-[300px] 
                          overflow-hidden text-ellipsis whitespace-nowrap"
                title={student?.name} // hover to show full name
              >
                {student?.name || "Murid"}
              </h2>

              {/* Semester Select (moves under name on mobile) */}
              <SemesterSelect
                semesters={semesters}
                selected={semester}
                onChange={(sem) => handleSemesterChange(studentId, sem)}
                placeholder="Pilih Semester..."
              />
            </div>

            {isLoading ? (
              <div className="text-center text-gray-400">
                <StudentParentTableSkeleton />
              </div>
            ) : !student || student.lessons?.length === 0 ? (
              <div className="text-center text-gray-500">
                Tidak ada pelajaran untuk {student?.name || "murid"}.
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
                    {student.lessons.map((lesson: any) => (
                      <tr
                        key={lesson.id}
                        className="even:bg-slate-50 hover:bg-lamaPurpleLight"
                      >
                        {/* <td className="p-3">{lesson.id}</td> */}
                        <td className="p-3">{lesson.subject?.name || "-"}</td>
                        <td className="hidden md:table-cell">
                          {lesson.class?.name || "Tidak Ada Kelas"}
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          {lesson.startTime}
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          {lesson.endTime}
                        </td>

                        <td>{lesson.day}</td>
                        <td className="hidden md:table-cell">
                          {lesson.teacherId
                            ? `${lesson.teacher?.name} `
                            : "Tidak ada guru"}
                        </td>
                        <td className="text-center lg:text-left ">
                          <Link
                            href={`/list/attendance/${lesson.class?.name}/${lesson.id}`}
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
      })}
    </div>
  );
}
