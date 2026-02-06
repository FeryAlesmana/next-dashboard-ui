"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SemesterSelect from "../SemesterSelect";
import StudentParentTableSkeleton from "../StudentParentTableSkeleton";
import Image from "next/image";
import Link from "next/link";
import { exTypes } from "@prisma/client";
import { useSearchParams } from "next/navigation";

type Semester = {
  label: string;
  start: Date;
  end: Date;
};

export default function ParentExamViewSemester({
  gradeLevel,
  userId,
  columns,
}: {
  userId: string;
  gradeLevel: any[];
  columns: any[];
}) {
  const searchParams = useSearchParams();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [selectedSemesters, setSelectedSemesters] = useState<{
    [studentId: string]: Semester;
  }>({});
  const [studentsWithExams, setStudentsWithExams] = useState<any[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadingMap, setLoadingMap] = useState<{
    [studentId: string]: boolean;
  }>({});

  const examCache = useRef<{ [key: string]: any[] }>({}); // key = `${studentId}_${semester.label}`

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

  const fetchExams = useCallback(
    async (studentId: string, semester: Semester) => {
      const cacheKey = `${studentId}_${semester.label}`;
      if (examCache.current[cacheKey]) {
        setStudentsWithExams((prev) => {
          const other = prev.filter((p) => p.id !== studentId);
          return [...other, { ...examCache.current[cacheKey] }];
        });
        return;
      }

      setLoadingMap((prev) => ({ ...prev, [studentId]: true }));

      try {
        const res = await fetch(
          `/api/parent-exams?studentId=${studentId}&startDate=${semester.start.toISOString()}&endDate=${semester.end.toISOString()}`
        );
        const exams = await res.json();

        const studentData = { ...exams, id: studentId };

        // Cache it
        examCache.current[cacheKey] = studentData;
        console.log(studentData, "student in exams");
        setStudentsWithExams((prev) => {
          const other = prev.filter((p) => p.id !== studentId);
          return [...other, studentData];
        });
      } catch (err) {
        console.error("Error fetching exams:", err);
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
      fetchExams(studentId, selected);
    });

    setSelectedSemesters(initialSemesters);
  }, [gradeLevel, fetchExams]);

  const handleSemesterChange = (studentId: string, semester: Semester) => {
    const updated = {
      ...selectedSemesters,
      [studentId]: semester,
    };

    setSelectedSemesters(updated);
    localStorage.setItem("selectedSemesters", JSON.stringify(updated));
    fetchExams(studentId, semester);
  };
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setHighlightedId(id);
      // Scroll into view smoothly
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Optional: remove highlight after a while
        setTimeout(() => setHighlightedId(null), 3000);
      }
    }
  }, [searchParams]);
  const examTypeLabel = {
    UJIAN_HARIAN: "Ujian Harian",
    UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
    UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
  } as const;

  if (!hydrated) return null;
  console.log(gradeLevel, "gradelevel in exam");

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Ujian Anak</h1>
      {gradeLevel.map(({ studentId, gradeLevel: gLevel, createdAt }) => {
        const student = studentsWithExams.find((s) => s.id === studentId);
        const semester = selectedSemesters[studentId];
        const semesters = generateSemesters(createdAt, gLevel);
        const isLoading = loadingMap[studentId];
        return (
          <div
            key={studentId}
            id={studentId} // ✅ anchor target for linking
            className={`mb-12 shadow-md rounded-md p-2 transition 
              ${highlightedId === studentId ? "ring-4 ring-yellow-400" : ""}`}
          >
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
            ) : !student || student.exams?.length === 0 ? (
              <div className="text-center text-gray-500">
                Belum ada Ujian untuk {student?.name || "murid"}.
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.accessor}
                          className={`px-4 py-3 font-semibold text-center ${
                            col.className ?? ""
                          }`}
                        >
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-center">
                    {student.exams.map((item: any) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
                      >
                        {/* <td>{item.id}</td> */}
                        <td className="p-4">{item.subjectName}</td>
                        <td className="hidden md:table-cell">
                          {item.className}
                        </td>
                        <td className="hidden md:table-cell">
                          {item.teacherName}
                        </td>
                        <td className="hidden md:table-cell">
                          {new Intl.DateTimeFormat("en-US").format(
                            new Date(item.date)
                          )}
                        </td>
                        <td className="hidden md:table-cell">
                          {new Date(item.startTime).toLocaleTimeString(
                            "id-ID",
                            {
                              timeZone: "Asia/Jakarta",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }
                          )}
                        </td>
                        <td className="hidden md:table-cell">
                          {new Date(item.endTime).toLocaleTimeString("id-ID", {
                            timeZone: "Asia/Jakarta",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </td>

                        <td className="hidden md:table-cell">
                          {item.exType
                            ? examTypeLabel[item.exType as exTypes]
                            : "-"}
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
