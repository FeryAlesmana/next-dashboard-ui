"use client";
import { assTypes, exTypes } from "@prisma/client";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";

export default function ExamTableClient({
  data,
  role,
  selected,
  onToggle,
  relatedData,
  onDeleted,
  onChanged,
  allowedStaff,
}: BaseTableClientProps) {
  const examTypeLabel = {
    UJIAN_HARIAN: "Ujian Harian",
    UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
    UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
  } as const;
  const allowedRole = role === "admin" || role === "teacher" || allowedStaff;
  return (
    <>
      <tr className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
        {(role === "admin" || allowedStaff) && (
          <td className="px-4 py-2">
            <input
              type="checkbox"
              checked={selected?.includes(data.id)}
              onChange={() => onToggle(data.id)}
            />
          </td>
        )}

        <td className="flex items-center p-4 gap-4">
          {data.lesson?.subject?.name || "-"}
        </td>
        <td>{data.lesson?.class?.name || "Tidak Ada Kelas"}</td>
        <td className="hidden md:table-cell">
          {data.lesson?.teacher
            ? `${data.lesson.teacher.name}`
            : "Tidak ada guru"}
        </td>
        <td className="hidden md:table-cell">
          {new Intl.DateTimeFormat("en-US").format(data.date)}
        </td>
        <td className="hidden md:table-cell">
          {" "}
          {data.startTime.toLocaleTimeString("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </td>
        <td className="hidden md:table-cell">
          {" "}
          {data.endTime.toLocaleTimeString("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </td>
        <td className="hidden md:table-cell">
          {data.exType ? examTypeLabel[data.exType as exTypes] : "-"}
        </td>
        <td>
          <div className="hidden md:table-cell">
            <div className="flex items-center gap-2">
              {allowedRole && (
                <>
                  <FormModal
                    table="exam"
                    type="update"
                    data={data}
                    relatedData={relatedData}
                    onChanged={onChanged}
                  ></FormModal>
                  <FormModal
                    table="exam"
                    type="delete"
                    id={data.id}
                    onDeleted={() => onDeleted?.([data.id])}
                  ></FormModal>
                </>
              )}
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}
