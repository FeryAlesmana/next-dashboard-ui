import Image from "next/image";
import Link from "next/link";

const ParentLessonView = ({
  students,
  columns,
}: {
  students: any[];
  columns: any[];
}) => {
  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Jadwal Anak</h1>

      {students.length === 0 ? (
        <div className="text-center text-gray-500">
          Tidak ada jadwal tersedia untuk anak Anda.
        </div>
      ) : (
        students.map((student) => (
          <div key={student.id} className="mb-12">
            <h2 className="text-xl font-semibold mb-4">{student.name}</h2>

            {student.lessons.length === 0 ? (
              <div className="text-center text-gray-500">
                Tidak ada jadwal untuk {student.name}.
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
                    {student.lessons.map((item: any) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
                      >
                        <td className="hidden md:table-cell">{item?.id}</td>
                        <td className="flex items-center p-4 gap-4">
                          {item.subject?.name || "-"}
                        </td>
                        <td className="hidden md:table-cell">
                          {item.class?.name}
                        </td>
                        <td className="hidden md:table-cell">
                          {item.startTime?.toLocaleTimeString("id-ID", {
                            timeZone: "Asia/Jakarta",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </td>
                        <td className="hidden md:table-cell">
                          {item.endTime?.toLocaleTimeString("id-ID", {
                            timeZone: "Asia/Jakarta",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </td>
                        <td>{item.day}</td>
                        <td className="hidden md:table-cell">
                          {item.teacherId
                            ? `${item.teacher?.name} ${item.teacher?.namalengkap}`
                            : "Tidak ada guru"}
                        </td>
                        <td>
                          <Link
                            href={`/list/attendance/${item.class?.name}/${item.id}`}
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
        ))
      )}
    </div>
  );
};

export default ParentLessonView;
