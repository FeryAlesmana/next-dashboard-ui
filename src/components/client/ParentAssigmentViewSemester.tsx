"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SemesterSelect from "../SemesterSelect";
import StudentParentTableSkeleton from "../StudentParentTableSkeleton";
import Image from "next/image";
import Link from "next/link";
import { assTypes, exTypes } from "@prisma/client";
import { useSearchParams } from "next/navigation";

type Semester = {
  label: string;
  start: Date;
  end: Date;
};

export default function ParentAssignmentViewSemester({
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
  const [studentsWithAssignment, setStudentsWithAssignment] = useState<any[]>(
    []
  );
  const [hydrated, setHydrated] = useState(false);
  const [loadingMap, setLoadingMap] = useState<{
    [studentId: string]: boolean;
  }>({});

  const assignmentCache = useRef<{ [key: string]: any[] }>({}); // key = `${studentId}_${semester.label}`

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

  const fetchAssignment = useCallback(
    async (studentId: string, semester: Semester) => {
      const cacheKey = `${studentId}_${semester.label}`;
      if (assignmentCache.current[cacheKey]) {
        setStudentsWithAssignment((prev) => {
          const other = prev.filter((p) => p.id !== studentId);
          return [...other, { ...assignmentCache.current[cacheKey] }];
        });
        return;
      }

      setLoadingMap((prev) => ({ ...prev, [studentId]: true }));

      try {
        const res = await fetch(
          `/api/parent-assignments?studentId=${studentId}&startDate=${semester.start.toISOString()}&endDate=${semester.end.toISOString()}`
        );
        const assignments = await res.json();

        const studentData = { ...assignments, id: studentId };

        // Cache it
        assignmentCache.current[cacheKey] = studentData;
        // console.log(studentData, "student in assignments");
        setStudentsWithAssignment((prev) => {
          const other = prev.filter((p) => p.id !== studentId);
          return [...other, studentData];
        });
      } catch (err) {
        console.error("Error fetching assignments:", err);
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
      const selected = semesters[0];

      initialSemesters[studentId] = selected;
      fetchAssignment(studentId, selected);
    });

    setSelectedSemesters(initialSemesters);
  }, [gradeLevel, fetchAssignment]);

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
    // localStorage.setItem("selectedSemesters", JSON.stringify(updated));
    fetchAssignment(studentId, semester);
  };

  const AssignmentsTypeLabel = {
    PEKERJAAN_RUMAH: "Pekerjaan Rumah",
    TUGAS_AKHIR: "Tugas Akhir",
    TUGAS_HARIAN: "Tugas Harian",
  } as const;

  if (!hydrated) return null;
  console.log(gradeLevel, "student in pas");

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tugas Anak</h1>
      {gradeLevel.map(({ studentId, gradeLevel: gLevel, createdAt }) => {
        const student = studentsWithAssignment.find((s) => s.id === studentId);
        const semester = selectedSemesters[studentId];
        const semesters = generateSemesters(createdAt, gLevel);
        // console.log(createdAt, "semester Option");

        const isLoading = loadingMap[studentId];
        return (
          <div
            key={studentId}
            id={studentId} // ✅ anchor target for linking
            className={`mb-12 shadow-md rounded-md p-2 transition 
              ${highlightedId === studentId ? "ring-4 ring-yellow-400" : ""}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold flex flex-row">
                <span className="">
                  {student?.name || "Murid"}
                  <hr />
                </span>
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
            ) : !student || student.assignment?.length === 0 ? (
              <div className="text-center text-gray-500">
                Belum ada Tugas untuk {student?.name || "murid"}.
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {columns.map((col: any) => (
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
                    {student.assignments.map((item: any) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
                      >
                        <td className="p-4">{item.subjectName}</td>
                        <td className="hidden md:table-cell">
                          {item.className}
                        </td>
                        <td className="hidden md:table-cell">
                          {item.teacherName}
                        </td>
                        <td className="hidden md:table-cell">
                          {new Date(item.dueDate).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="hidden md:table-cell">
                          {item.assType
                            ? AssignmentsTypeLabel[item.assType as assTypes]
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
