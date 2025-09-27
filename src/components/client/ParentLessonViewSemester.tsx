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

  const generateSemesters = (gradeLevel: number): Semester[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startYear = currentYear - (gradeLevel - 1);

    const semesters: Semester[] = [];

    for (let year = startYear; year <= currentYear; year++) {
      semesters.push({
        label: `Ganjil ${year}/${year + 1}`,
        start: new Date(`${year}-07-01`),
        end: new Date(`${year}-12-31`),
      });
      semesters.push({
        label: `Genap ${year}/${year + 1}`,
        start: new Date(`${year + 1}-01-01`),
        end: new Date(`${year + 1}-06-30`),
      });
    }

    return semesters.reverse();
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

    gradeLevel.forEach(({ studentId, gradeLevel }) => {
      const semesters = generateSemesters(gradeLevel);
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

      {gradeLevel.map(({ studentId, gradeLevel: gLevel }) => {
        const student = studentsWithLessons.find((s) => s.id === studentId);
        const semester = selectedSemesters[studentId];
        const semesters = generateSemesters(gLevel);
        const isLoading = loadingMap[studentId];

        return (
          <div key={studentId} className="mb-12">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">
                {student?.name || "Murid"}
              </h2>
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
                      <th className="px-4 py-3 text-left">ID Jadwal</th>
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
                        <td className="p-3">{lesson.id}</td>
                        <td className="p-3">{lesson.subject?.name || "-"}</td>
                        <td className="hidden md:table-cell">
                          {lesson.class?.name}
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          {new Date(lesson.startTime).toLocaleTimeString(
                            "id-ID"
                          )}
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          {new Date(lesson.endTime).toLocaleTimeString("id-ID")}
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
