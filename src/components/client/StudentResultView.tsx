"use client";
import { resTypes } from "@prisma/client";

const StudentResultView = ({ results }: { results: any[] }) => {
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
    { header: "Nilai", accessor: "score" },
    { header: "Guru", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Kelas", accessor: "class" },
    { header: "Tipe", accessor: "type", className: "hidden md:table-cell" },
  ];

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Hasil Ujian & Tugas Saya</h1>

      {results.length === 0 ? (
        <div className="text-center text-gray-500">
          Belum ada hasil ujian atau tugas.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tugas Section */}
          <div className="mb-6 bg-gray-200 rounded-md p-2">
            <h3 className="text-xl font-bold mb-4 p-2 w-fit border-l-2 border-orange-300">
              Tugas
            </h3>
            {results.filter((r) => r?.type === "Tugas").length === 0 ? (
              <div className="text-gray-500 text-center p-2">
                Belum ada hasil tugas.
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
                    {results
                      .filter((r) => r?.type === "Tugas")
                      .map((res) => (
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
          <div className="mb-6 bg-gray-200 rounded-md p-2">
            <div className="text-xl font-bold mb-4 p-2 w-fit border-l-2 border-blue-400">
              Ujian
            </div>

            {[
              "UJIAN_HARIAN",
              "UJIAN_TENGAH_SEMESTER",
              "UJIAN_AKHIR_SEMESTER",
            ].map((resType) => {
              const examResults = results.filter(
                (r) => r?.type === "Ujian" && r?.resultType === resType
              );

              const readableLabel =
                resultTypelabel[resType as keyof typeof resultTypelabel];

              return (
                <div key={resType} className="mb-4 ml-4">
                  <h3 className="text-lg font-medium mb-2">{readableLabel}</h3>
                  {examResults.length === 0 ? (
                    <div className="text-gray-500 text-center p-2">
                      Belum ada hasil {readableLabel.toLowerCase()}.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            {columns
                              .filter((col) => col.accessor !== "type") // exclude "type" col
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
                          {examResults.map((res) => (
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
};

export default StudentResultView;
