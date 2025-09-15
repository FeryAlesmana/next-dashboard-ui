"use client";
import { resTypes, Student, Subject, Teacher } from "@prisma/client";
import PrintButton from "../PrintButton";
import { Semester } from "./StudentPaymentView";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Select from "react-select";

type SingleStudent = Student & {
  student_details: { nisn: string } | null;
  class: {
    lessons: { subject: Subject | null; teacher: Teacher | null }[];
    name: string;
  } | null;
  grade: { level: number } | null;
};
const SingleResultPageClient = ({
  student,
  lessons,
  results,
  gradeLevel,
}: {
  student: SingleStudent;
  lessons: any[];
  results: any[];
  gradeLevel: number;
}) => {
  const getScore = (
    results: any[],
    lessonId: number,
    types: resTypes[]
  ): number => {
    const matching = results.filter((res) => {
      const source = res.exam ?? res.assignment;
      return source?.lessonId === lessonId && types.includes(res.resultType);
    });
    if (matching.length === 0) return 0;
    const total = matching.reduce((sum, res) => sum + (res.score ?? 0), 0);
    return Math.round(total / matching.length);
  };

  const avgList: number[] = [];

  const generateSemesters = (gradeLevel: number): Semester[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startYear = currentYear - (gradeLevel - 1);

    const generated: Semester[] = [];

    for (let year = startYear; year <= currentYear; year++) {
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

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(() => {
    const initial: Record<string, string | number> = {};
    const value = searchParams.get("semester");
    if (value) initial["semester"] = value;
    return initial;
  });

  const updateQuery = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value.toString());

    // Reset to page 1 if limit or filter/sort changes
    if (["limit", "sort", "semester"].includes(key)) {
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const semesterOptions = generateSemesters(gradeLevel).map((sem) => ({
    label: sem.label,
    value: JSON.stringify({
      start: sem.start.toISOString(),
      end: sem.end.toISOString(),
    }),
  }));

  const selectedValue = filters["semester"]?.toString() || "";
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-800">
        Laporan Nilai Murid
      </h1>
      <div className="w-min-[200px] mb-5">
        <Select
          instanceId="semester"
          placeholder={`Filter by Semester`}
          options={semesterOptions}
          value={
            selectedValue
              ? {
                  label:
                    semesterOptions.find(
                      (opt) => opt.value.toString() === selectedValue
                    )?.label || "",
                  value: selectedValue,
                }
              : null
          }
          onChange={(selected) => {
            const value = selected ? selected.value : "";
            setFilters((prev) => ({
              ...prev,
              ["semester"]: value,
            }));
            updateQuery("semester", value);
          }}
          isClearable
        />
      </div>
      <div className="mb-8 bg-white shadow rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p>
            <span className="font-semibold">Nama Murid:</span> {student.name}{" "}
            {student.namalengkap || "-"}
          </p>
          <p>
            <span className="font-semibold">NISN:</span>{" "}
            {student.student_details?.nisn || "-"}
          </p>
          <p>
            <span className="font-semibold">Kelas:</span>{" "}
            {student.class?.name || "-"}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-purple-100 text-gray-800">
            <tr>
              <th className="p-3 text-left border-b border-gray-300 hidden md:table-cell">
                No
              </th>
              <th className="p-3 text-left border-b border-gray-300">
                Mata Pelajaran
              </th>
              <th className="p-3 text-left border-b border-gray-300 hidden md:table-cell">
                Nama Guru
              </th>
              <th className="p-3 text-center border-b border-gray-300">
                Tugas
              </th>
              <th className="p-3 text-center border-b border-gray-300">UH</th>
              <th className="p-3 text-center border-b border-gray-300">UTS</th>
              <th className="p-3 text-center border-b border-gray-300">UAS</th>
              <th className="p-3 text-center border-b border-gray-300">
                Rata-rata
              </th>
            </tr>
          </thead>
          <tbody>
            {lessons.length === 0 ? (
              <tr>
                <td
                  colSpan={8} // adjust based on how many columns you have
                  className="p-3 border-b border-gray-200 text-center text-gray-500"
                >
                  Tidak ada data di table ini
                </td>
              </tr>
            ) : (
              <>
                {lessons.map((lesson, index) => {
                  const tugas =
                    getScore(results, lesson.id, [
                      "TUGAS_HARIAN",
                      "PEKERJAAN_RUMAH",
                    ]) || 0;
                  const UH =
                    getScore(results, lesson.id, ["UJIAN_HARIAN"]) || 0;
                  const uts =
                    getScore(results, lesson.id, ["UJIAN_TENGAH_SEMESTER"]) ||
                    0;
                  const uas =
                    getScore(results, lesson.id, ["UJIAN_AKHIR_SEMESTER"]) || 0;
                  const avg = Math.round((tugas + UH + uts + uas) / 4);
                  avgList.push(avg);

                  return (
                    <tr
                      key={lesson.id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-purple-50 transition-colors duration-150`}
                    >
                      <td className="p-3 border-b border-gray-200 hidden md:table-cell">
                        {index + 1}
                      </td>
                      <td className="p-3 border-b border-gray-200">
                        {lesson.subject?.name}
                      </td>
                      <td className="p-3 border-b border-gray-200 hidden md:table-cell">
                        {lesson.teacher?.name} {lesson.teacher?.namalengkap}
                      </td>
                      <td className="p-3 border-b border-gray-200 text-center">
                        {tugas}
                      </td>
                      <td className="p-3 border-b border-gray-200 text-center">
                        {UH}
                      </td>
                      <td className="p-3 border-b border-gray-200 text-center">
                        {uts}
                      </td>
                      <td className="p-3 border-b border-gray-200 text-center">
                        {uas}
                      </td>
                      <td className="p-3 border-b border-gray-200 text-center font-semibold">
                        {avg}
                      </td>
                    </tr>
                  );
                })}

                {avgList.length > 0 && (
                  <>
                    {/* Desktop version */}
                    <tr className="font-bold hidden md:table-row">
                      <td
                        colSpan={6}
                        className="p-3 border-t border-gray-300 text-center"
                      >
                        Rata-Rata Nilai Keseluruhan
                      </td>
                      <td className="p-3 border-t border-gray-300 text-center">
                        {Math.round(
                          avgList.reduce((acc, curr) => acc + curr, 0) /
                            avgList.length
                        )}
                      </td>
                    </tr>

                    {/* Mobile version */}
                    <tr className="font-bold md:hidden">
                      <td
                        colSpan={5}
                        className="p-3 border-t border-gray-300 text-center"
                      >
                        Rata-Rata
                      </td>
                      <td className="p-3 border-t border-gray-300 text-center">
                        {Math.round(
                          avgList.reduce((acc, curr) => acc + curr, 0) /
                            avgList.length
                        )}
                      </td>
                    </tr>
                  </>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
      <PrintButton />
    </div>
  );
};

export default SingleResultPageClient;
