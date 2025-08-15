import { exTypes } from "@prisma/client";

const ParentExamView = ({
  students,
  columns,
}: {
  students: any[];
  columns: any[];
}) => {
  const examTypeLabel = {
    UJIAN_HARIAN: "Ujian Harian",
    UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
    UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
  } as const;
  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Ujian Anak</h1>

      {students.length === 0 ? (
        <div className="text-center text-gray-500">
          Belum ada Ujian tersedia untuk anak Anda.
        </div>
      ) : (
        students.map((student) => (
          <div key={student.id} className="mb-12">
            <h2 className="text-xl font-semibold mb-4">{student.name}</h2>

            {student.exams.length === 0 ? (
              <div className="text-center text-gray-500">
                Belum ada Ujian untuk {student.name}.
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
                          {item.startTime.toLocaleTimeString("id-ID", {
                            timeZone: "Asia/Jakarta",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="hidden md:table-cell">
                          {item.endTime.toLocaleTimeString("id-ID", {
                            timeZone: "Asia/Jakarta",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="hidden md:table-cell">
                          {item.exTypes ? examTypeLabel[item.exTypes as exTypes] : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ParentExamView;
