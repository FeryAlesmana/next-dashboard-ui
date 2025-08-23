"use client";
import { resTypes } from "@prisma/client";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";

export default function ResultTableClient({
  data,
  role,
  selected,
  onToggle,
  relatedData,
  onDeleted,
  onChanged,
}: BaseTableClientProps) {
  const resultTypelabel = {
    UJIAN_HARIAN: "Ujian Harian",
    UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
    UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
    PEKERJAAN_RUMAH: "Pekerjaan Rumah",
    TUGAS_AKHIR: "Tugas Akhir",
    TUGAS_HARIAN: "Tugas Harian",
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

        <td className="p-4">{data?.subject || "-"}</td>
        <td>{data.student}</td>
        <td className="hidden md:table-cell">{data.score}</td>
        <td className="hidden md:table-cell">{data.teacher}</td>
        <td className="hidden md:table-cell">{data.class}</td>
        <td className="hidden md:table-cell">
          <span
            className={`  px-2 py-1 rounded-full text-xs font-medium
    ${data?.selectedType === "Ujian" ? "bg-blue-100 text-blue-800" : ""}
    ${data?.selectedType === "Tugas" ? "bg-green-100 text-green-800" : ""}`}
          >
            {data?.selectedType}
          </span>

          {" - "}
          {data?.resultType
            ? resultTypelabel[data?.resultType as resTypes]
            : " - "}
        </td>

        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal
                  table="result"
                  type="update"
                  data={data}
                  relatedData={relatedData}
                  onChanged={onChanged}
                ></FormModal>
                <FormModal
                  table="result"
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
