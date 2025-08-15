import { assTypes } from "@prisma/client";

const ParentAssignmentView = ({
  students,
  columns,
}: {
  students: any;
  columns: any;
}) => {
  const AssignmentsTypeLabel = {
    PEKERJAAN_RUMAH: "Pekerjaan Rumah",
    TUGAS_AKHIR: "Tugas Akhir",
    TUGAS_HARIAN: "Tugas Harian",
  } as const;
  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tugas Anak</h1>

      {students.length === 0 ? (
        <div className="text-center text-gray-500">
          Belum ada Tugas tersedia untuk anak Anda.
        </div>
      ) : (
        students.map((student: any) => (
          <div key={student.id} className="mb-12">
            <h2 className="text-xl font-semibold mb-4">{student.name}</h2>

            {student.assignments.length === 0 ? (
              <div className="text-center text-gray-500">
                Belum ada Tugas untuk {student.name}.
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
                          {item.dueDate.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="hidden md:table-cell">
                          {item.assTypes
                            ? AssignmentsTypeLabel[item.assTypes as assTypes]
                            : "-"}
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

export default ParentAssignmentView;
