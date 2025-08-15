"use client";
import { assTypes, exTypes } from "@prisma/client";
import FormModal from "../FormModal";

export default function ExamTableClient({
  data,
  role,
  selected,
  onToggle,
  relatedData,
}: {
  data: any;
  role: string;
  selected: string[];
  relatedData: any;
  onToggle: (id: string) => void;
}) {
  const examTypeLabel = {
    UJIAN_HARIAN: "Ujian Harian",
    UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
    UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
  } as const;
  return (
    <>
      <tr className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
        {role === "admin" && (
          <td className="px-4 py-2">
            <input
              type="checkbox"
              checked={selected?.includes(data.id)}
              onChange={() => onToggle(data.id)}
            />
          </td>
        )}

        <td className="flex items-center p-4 gap-4">
          {data.lesson.subject?.name || "-"}
        </td>
        <td>{data.lesson.class.name}</td>
        <td className="hidden md:table-cell">
          {data.lesson.teacher
            ? `${data.lesson.teacher.name} ${data.lesson.teacher.namalengkap}`
            : "Tidak ada guru"}
        </td>
        <td className="hidden md:table-cell">
          {" "}
          {data.startTime.toLocaleDateString("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            day: "numeric",
            month: "numeric",
          })}
        </td>
        <td className="hidden md:table-cell">
          {" "}
          {data.endTime.toLocaleDateString("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            day: "numeric",
            month: "numeric",
          })}
        </td>
        <td className="hidden md:table-cell">
          {data.exType ? examTypeLabel[data.exType as exTypes] : "-"}
        </td>
        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal
                  table="exam"
                  type="update"
                  data={data}
                  relatedData={relatedData}
                ></FormModal>
                <FormModal table="exam" type="delete" id={data.id}></FormModal>
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
