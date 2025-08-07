import { getCurrentUser } from "@/lib/utils";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { resTypes } from "@prisma/client";
import PrintButton from "@/components/PrintButton";

const resultTypelabel = {
  UJIAN_HARIAN: "Ujian Harian",
  UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
  UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
  PEKERJAAN_RUMAH: "Pekerjaan Rumah",
  TUGAS_AKHIR: "Tugas Akhir",
  TUGAS_HARIAN: "Tugas Harian",
} as const;

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

const SingleResultPage = async ({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) => {
  const { role } = await getCurrentUser();
  if (role === undefined) return notFound();

  const { studentId } = await params;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      student_details: { select: { nisn: true } },
      class: {
        include: {
          lessons: {
            include: {
              subject: true,
              teacher: true,
            },
          },
        },
      },
    },
  });

  if (!student || !student.class) return notFound();

  const results = await prisma.result.findMany({
    where: { studentId: student.id },
    include: {
      exam: { include: { lesson: true } },
      assignment: { include: { lesson: true } },
    },
  });

  const lessons = student.class.lessons;

  // Group results by subject-teacher pair
  const groupedResults = new Map<
    string,
    {
      subjectName: string;
      teacherName: string;
      tugas: number;
      uts: number;
      uas: number;
      avg: number;
    }
  >();

  // results.forEach((result) => {
  //   const source = result.exam ?? result.assignment;
  //   const lesson = source?.lesson;

  //   if (!lesson) return;

  //   const key = `${lesson.subject?.id}-${lesson.teacher?.id}`;

  //   if (!groupedResults.has(key)) {
  //     groupedResults.set(key, {
  //       subjectName: lesson.subject?.name ?? "-",
  //       teacherName: `${lesson.teacher?.name ?? ""} ${
  //         lesson.teacher?.surname ?? ""
  //       }`,
  //       tugas: 0,
  //       uts: 0,
  //       uas: 0,
  //       avg: 0,
  //     });
  //   }

  //   const entry = groupedResults.get(key)!;

  //   // Assign scores based on type
  //   switch (result.resultType) {
  //     case "TUGAS_HARIAN":
  //     case "PEKERJAAN_RUMAH":
  //       entry.tugas = result.score ?? 0;
  //       break;
  //     case "UJIAN_TENGAH_SEMESTER":
  //       entry.uts = result.score ?? 0;
  //       break;
  //     case "UJIAN_AKHIR_SEMESTER":
  //       entry.uas = result.score ?? 0;
  //       break;
  //   }

  //   // Calculate average (include all 3 types)
  //   entry.avg = parseFloat(
  //     ((entry.tugas + entry.uts + entry.uas) / 3).toFixed(2)
  //   );
  // });
  const avgList: number[] = [];
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-800">
        Laporan Nilai Murid
      </h1>

      <div className="mb-8 bg-white shadow rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p>
            <span className="font-semibold">Nama Murid:</span> {student.name}{" "}
            {student.surname}
          </p>
          <p>
            <span className="font-semibold">NISN:</span>{" "}
            {student.student_details?.nisn}
          </p>
          <p>
            <span className="font-semibold">Kelas:</span> {student.class.name}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-purple-100 text-gray-800">
            <tr>
              <th className="p-3 text-left border-b border-gray-300">No</th>
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
            {lessons.map((lesson, index) => {
              const tugas =
                getScore(results, lesson.id, [
                  "TUGAS_HARIAN",
                  "PEKERJAAN_RUMAH",
                ]) || 0;
              const UH = getScore(results, lesson.id, ["UJIAN_HARIAN"]) || 0;
              const uts =
                getScore(results, lesson.id, ["UJIAN_TENGAH_SEMESTER"]) || 0;
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
                  <td className="p-3 border-b border-gray-200">{index + 1}</td>
                  <td className="p-3 border-b border-gray-200">
                    {lesson.subject?.name}
                  </td>
                  <td className="p-3 border-b border-gray-200 hidden md:table-cell">
                    {lesson.teacher?.name} {lesson.teacher?.surname}
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
              <tr className=" font-bold">
                <td
                  className="p-3 border-t border-gray-300 text-center"
                  colSpan={6}
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
            )}
          </tbody>
        </table>
      </div>
      <PrintButton />
    </div>
  );
};

export default SingleResultPage;
