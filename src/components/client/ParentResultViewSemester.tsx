"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SemesterSelect from "../SemesterSelect";
import StudentParentTableSkeleton from "../StudentParentTableSkeleton";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Semester = {
  label: string;
  start: Date;
  end: Date;
};

export default function ParentResultViewSemester({
  gradeLevel,
  userId,
}: {
  userId: string;
  gradeLevel: any[];
}) {
  const searchParams = useSearchParams();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [selectedSemesters, setSelectedSemesters] = useState<{
    [studentId: string]: Semester;
  }>({});
  const [studentsWithResults, setStudentsWithResults] = useState<any[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadingMap, setLoadingMap] = useState<{
    [studentId: string]: boolean;
  }>({});

  const resultCache = useRef<{ [key: string]: any[] }>({}); // key = `${studentId}_${semester.label}`

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

  const fetchResult = useCallback(
    async (studentId: string, semester: Semester) => {
      const cacheKey = `${studentId}_${semester.label}`;
      if (resultCache.current[cacheKey]) {
        setStudentsWithResults((prev) => {
          const other = prev.filter((p) => p.id !== studentId);
          return [...other, { ...resultCache.current[cacheKey] }];
        });
        return;
      }

      setLoadingMap((prev) => ({ ...prev, [studentId]: true }));

      try {
        const res = await fetch(
          `/api/parent-results?studentId=${studentId}&startDate=${semester.start.toISOString()}&endDate=${semester.end.toISOString()}`
        );
        const results = await res.json();

        const studentData = { ...results, id: studentId };
        console.log(studentData, "studentData in result");

        // Cache it
        resultCache.current[cacheKey] = studentData;

        setStudentsWithResults((prev) => {
          const other = prev.filter((p) => p.id !== studentId);
          return [...other, studentData];
        });
      } catch (err) {
        console.error("Error fetching results:", err);
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
      fetchResult(studentId, selected);
    });

    setSelectedSemesters(initialSemesters);
  }, [gradeLevel, fetchResult]);

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

  const handleSemesterChange = (studentId: string, semester: Semester) => {
    const updated = {
      ...selectedSemesters,
      [studentId]: semester,
    };

    setSelectedSemesters(updated);
    localStorage.setItem("selectedSemesters", JSON.stringify(updated));
    fetchResult(studentId, semester);
  };
  type ResultType =
    | "UJIAN_HARIAN"
    | "UJIAN_TENGAH_SEMESTER"
    | "UJIAN_AKHIR_SEMESTER"
    | "PEKERJAAN_RUMAH"
    | "TUGAS_AKHIR"
    | "TUGAS_HARIAN";

  const resultTypelabel: Record<ResultType, string> = {
    UJIAN_HARIAN: "Ujian Harian",
    UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
    UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
    PEKERJAAN_RUMAH: "Pekerjaan Rumah",
    TUGAS_AKHIR: "Tugas Akhir",
    TUGAS_HARIAN: "Tugas Harian",
  };
  const columns = [
    { header: "Pelajaran", accessor: "subject" },
    { header: "Nilai", accessor: "score" },
    { header: "Guru", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Kelas", accessor: "class" },
    { header: "Tipe", accessor: "type", className: "hidden md:table-cell" },
  ];
  if (!hydrated) return null;

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Hasil Ujian & Tugas Anak</h1>
      {gradeLevel.map(({ studentId, gradeLevel: gLevel, createdAt }) => {
        const student = studentsWithResults.find((s) => s.id === studentId);
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
            ) : !student || student.results?.length === 0 ? (
              <div className="text-center text-gray-500">
                Tidak ada data Nilai untuk {student?.name || "murid"}.
              </div>
            ) : (
              <div className="space-y-8">
                {/* Tugas Section */}
                <div className="mb-6 bg-gray-200 rounded-md p-2">
                  <h3 className="text-xl font-bold mb-4 p-2 w-fit border-l-2 border-orange-300">
                    Tugas
                  </h3>
                  {student.results?.filter((r: any) => r?.type === "Tugas")
                    .length === 0 ? (
                    <div className="text-gray-500 text-center p-2">
                      Belum ada hasil tugas dari {student.name}.
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
                          {student.results
                            .filter((r: any) => r?.type === "Tugas")
                            .map((res: any) => (
                              <tr
                                key={res?.id}
                                className="even:bg-slate-50 hover:bg-lamaPurpleLight"
                              >
                                <td className="p-4">{res?.subject}</td>
                                <td className="p-4">{res?.score ?? "-"}</td>
                                <td className="p-4 hidden md:table-cell">
                                  {res?.teacher}
                                </td>
                                <td className="p-4">{res?.class || "Tidak Ada Kelas"}</td>
                                <td className="p-4 hidden md:table-cell">
                                  {res?.resultType
                                    ? resultTypelabel[
                                        res?.resultType as ResultType
                                      ]
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Ujian Section */}
                <div className="mb-6 bg-gray-200 rounded-md p-2">
                  <h3 className="text-xl font-bold mb-4 p-2 w-fit border-l-2 border-blue-400">
                    Ujian
                  </h3>

                  {[
                    "UJIAN_HARIAN",
                    "UJIAN_TENGAH_SEMESTER",
                    "UJIAN_AKHIR_SEMESTER",
                  ].map((resType) => {
                    const examResults = student.results?.filter(
                      (r: any) =>
                        r?.type === "Ujian" && r?.resultType === resType
                    );

                    const readableLabel =
                      resultTypelabel[resType as ResultType] ?? resType;

                    return (
                      <div key={resType} className="mb-4 ml-4">
                        <h4 className="text-lg font-medium mb-2">
                          {readableLabel}
                        </h4>
                        {examResults.length === 0 ? (
                          <div className="text-gray-500 text-center p-2">
                            Belum ada hasil {readableLabel.toLowerCase()} dari{" "}
                            {student.name}.
                          </div>
                        ) : (
                          <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  {columns
                                    .filter((col) => col.accessor !== "type")
                                    .map((col) => (
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
                                {examResults.map((res: any) => (
                                  <tr
                                    key={res?.id}
                                    className="even:bg-slate-50 hover:bg-lamaPurpleLight"
                                  >
                                    <td className="p-4">{res?.subject}</td>
                                    <td className="p-4">{res?.score ?? "-"}</td>
                                    <td className="p-4 hidden md:table-cell">
                                      {res?.teacher}
                                    </td>
                                    <td className="p-4">{res?.class || "Tidak Ada Kelas"}</td>
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
