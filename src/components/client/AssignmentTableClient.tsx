"use client";
import { assTypes } from "@prisma/client";
import FormModal from "../FormModal";
export type BaseTableClientProps = {
  data: any;
  role: string;
  selected: string[];
  relatedData: any;
  onToggle: (id: string) => void;
  onDeleted?: (ids: (string | number)[]) => void;
  onChanged?: (item: any) => void;
};

export default function AssignmentTableClient({
  data,
  role,
  selected,
  onToggle,
  relatedData,
  onDeleted,
  onChanged,
}: BaseTableClientProps) {
  const AssignmentsTypeLabel = {
    PEKERJAAN_RUMAH: "Pekerjaan Rumah",
    TUGAS_AKHIR: "Tugas Akhir",
    TUGAS_HARIAN: "Tugas Harian",
  } as const;

  const isOverdue = new Date(data.dueDate) < new Date();
  return (
    <>
      <tr
        className={`border-b border-gray-200 text-sm hover:bg-lamaPurpleLight ${
          isOverdue ? "bg-red-100" : "even:bg-slate-50"
        }`}
      >
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
          {data.dueDate.toLocaleDateString("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            day: "numeric",
            month: "numeric",
          })}
        </td>
        <td className="hidden md:table-cell">
          {data.assType ? AssignmentsTypeLabel[data.assType as assTypes] : "-"}
        </td>
        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal
                  table="assignment"
                  type="update"
                  data={data}
                  relatedData={relatedData}
                  onChanged={onChanged}
                ></FormModal>
                <FormModal
                  table="assignment"
                  type="delete"
                  id={data.id}
                  onDeleted={() => onDeleted?.([data.id])}
                ></FormModal>
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
