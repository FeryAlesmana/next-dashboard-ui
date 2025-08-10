"use client";
import { resTypes } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

const ParentResultView = ({
  groupedByStudent,
  role,
}: {
  groupedByStudent: any[];
  role?: string;
}) => {
  const resultTypelabel = {
    UJIAN_HARIAN: "Ujian Harian",
    UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
    UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
    PEKERJAAN_RUMAH: "Pekerjaan Rumah",
    TUGAS_AKHIR: "Tugas Akhir",
    TUGAS_HARIAN: "Tugas Harian",
  } as const;
  const columns = [
    { header: "Pelajaran", accessor: "subject" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Murid", accessor: "Student" }]
      : []),
    { header: "Nilai", accessor: "score" },
    { header: "Guru", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Kelas", accessor: "class" },
    { header: "Tipe", accessor: "type", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Aksi", accessor: "action" }]
      : []),
  ];

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Hasil Ujian & Tugas Anak</h1>

      {groupedByStudent.length === 0 ? (
        <div className="text-center text-gray-500">
          Tidak ada hasil ujian atau tugas.
        </div>
      ) : (
        groupedByStudent.map((student, index) => (
          <div
            key={student.id}
            className={`mb-12 p-2 rounded-md border-l-4 shadow-md ${
              index % 2 === 0 ? "border-l-orange-300" : "border-l-blue-300"
            }`}
          >
            <div className="flex flex-row justify-between">
              <h2 className="text-xl font-semibold mb-4">{student.name}</h2>
              <Link href={`/list/results/${student.id}`} className="text-right">
                <Image src="/moreDark.png" alt="" width={20} height={20} />
              </Link>
            </div>

            <div className="space-y-8">
              {/* Tugas Section */}
              <div className="mb-6 bg-gray-200 rounded-md p-2">
                <h3 className="text-xl font-bold mb-4 p-2 w-fit border-l-2 border-orange-300">
                  Tugas
                </h3>
                {student.results.filter((r: any) => r?.type === "Tugas")
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
                              <td className="p-4">{res?.class}</td>
                              <td className="p-4 hidden md:table-cell">
                                {res?.resultType
                                  ? resultTypelabel[res?.resultType as resTypes]
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
              <div className="mb-6 bg-gray-200 rounded-md p-2 slate-600">
                <div className="text-xl font-bold mb-4 p-2 w-fit border-l-2 border-blue-400">
                  Ujian{" "}
                </div>

                {[
                  "UJIAN_HARIAN",
                  "UJIAN_TENGAH_SEMESTER",
                  "UJIAN_AKHIR_SEMESTER",
                ].map((resType) => {
                  const examResults = student.results.filter(
                    (r: any) => r?.type === "Ujian" && r?.resultType === resType
                  );

                  // Format the enum to readable label
                  const readableLabel = resType
                    .replace("UJIAN_", "")
                    .split("_")
                    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                    .join(" ");

                  return (
                    <div key={resType} className="mb-4 ml-4">
                      <h3 className="text-lg font-medium mb-2">
                        {readableLabel}
                      </h3>
                      {examResults.length === 0 ? (
                        <div className="text-gray-500 text-center p-2">
                          Belum ada hasil ujian {readableLabel.toLowerCase()}{" "}
                          dari {student.name}.
                        </div>
                      ) : (
                        <div className="overflow-x-auto border rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                {columns
                                  .filter((col) => col.accessor !== "type") // 👈 exclude the "type" column
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
                                  <td className="p-4">{res?.class}</td>
                                  {/* <td className="p-4">{res?.type}</td> */}
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
          </div>
        ))
      )}
    </div>
  );
};

export default ParentResultView;
