"use client";
import { useState } from "react";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";
import { assTypes, exTypes, resTypes } from "@prisma/client";

export function MobileExamCard({
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

  const examTypeLabel = {
    UJIAN_HARIAN: "Ujian Harian",
    UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
    UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
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
            title={data.lesson.subject?.name || "-"}
          >
            {data.lesson.subject?.name || "-"}
          </div>
          <div className="text-sm text-gray-600">
            Kelas : {data.lesson.class?.name || "Tidak Ada Kelas"}
          </div>
          <div className="text-xs text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
            Guru :{" "}
            {data.lesson.teacher
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
              Tanggal :{" "}
              <span className="font-normal">
                {new Intl.DateTimeFormat("en-US").format(data.date)}
              </span>
            </div>
            <div className="font-medium">
              Waktu Mulai :{" "}
              <span className="font-normal">
                {" "}
                {data.startTime.toLocaleTimeString("id-ID", {
                  timeZone: "Asia/Jakarta",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>
            <div className="font-medium">
              Waktu Selesai :{" "}
              <span className="font-normal">
                {" "}
                {data.endTime.toLocaleTimeString("id-ID", {
                  timeZone: "Asia/Jakarta",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>
            <div className="font-medium">
              Tipe Ujian :{" "}
              <span className="font-normal">
                {data.exType ? examTypeLabel[data.exType as exTypes] : "-"}
              </span>
            </div>
          </div>

          {allowedRole && (
            <div className="flex items-center gap-3 mt-4">
              {/* Update */}
              <div className="flex items-center gap-2">
                <FormModal
                  table="exam"
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
                  table="exam"
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
