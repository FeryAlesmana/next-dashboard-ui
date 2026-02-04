"use client";
import { useState } from "react";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";
import { assTypes, resTypes } from "@prisma/client";

export function MobileAssignmentCard({
  data,
  selected,
  onToggle,
  relatedData,
  onChanged,
  onDeleted,
  role,
  allowedStaff,
}: BaseTableClientProps) {
  const [open, setOpen] = useState(false);

  const AssignmentsTypeLabel = {
    PEKERJAAN_RUMAH: "Pekerjaan Rumah",
    TUGAS_AKHIR: "Tugas Akhir",
    TUGAS_HARIAN: "Tugas Harian",
  } as const;
  const allowedRole = role === "admin" || role === "teacher" || allowedStaff;
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between min-w-0">
        {/* Checkbox */}
        {(role === "admin" || allowedStaff) && (
          <input
            type="checkbox"
            checked={selected.includes(data.id)}
            onChange={() => onToggle(data.id)}
            className="mt-1"
          />
        )}

        <div className="ml-3 flex-1 min-w-0">
          <div
            className="font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
            title={data.lesson?.subject?.name || "-"}
          >
            {data.lesson?.subject?.name || "-"}
          </div>
          <div className="text-sm text-gray-600">
            Kelas : {data.lesson?.class?.name || "Tidak Ada Kelas"}
          </div>
          <div className="text-xs text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
            Guru :{" "}
            {data.lesson?.teacher
              ? `${data.lesson.teacher.name} `
              : "Tidak ada guru"}
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="text-indigo-600 text-sm"
        >
          {open ? "Sembunyikan" : "Detail"}
        </button>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t space-y-3 text-sm text-gray-700 ml-3">
          <div className="space-y-1">
            <div className="font-medium">
              Deadline :{" "}
              <span className="font-normal">
                {data.dueDate.toLocaleDateString("id-ID", {
                  timeZone: "Asia/Jakarta",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                  day: "numeric",
                  month: "numeric",
                })}
              </span>
            </div>
            <div className="font-medium">
              Tipe Tugas:{" "}
              <span className="font-normal">
                {data.assType
                  ? AssignmentsTypeLabel[data.assType as assTypes]
                  : "-"}
              </span>
            </div>
          </div>

          {allowedRole && (
            <div className="flex items-center gap-3 mt-4">
              {/* Update */}
              <div className="flex items-center gap-2">
                <FormModal
                  table="assignment"
                  type="update"
                  data={data}
                  relatedData={relatedData}
                  onChanged={onChanged}
                />
                <span className="text-sm text-blue-600 font-medium cursor-pointer select-none">
                  Ubah
                </span>
              </div>

              {/* Delete */}
              <div className="flex items-center gap-2">
                <FormModal
                  table="assignment"
                  type="delete"
                  id={data.id}
                  onDeleted={() => onDeleted?.([data.id])}
                />
                <span className="text-sm text-red-600 font-medium cursor-pointer select-none">
                  Hapus
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
