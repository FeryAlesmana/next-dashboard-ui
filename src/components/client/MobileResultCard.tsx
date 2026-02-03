"use client";
import { useState } from "react";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";
import { resTypes } from "@prisma/client";

export function MobileResultCard({
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

  const resultTypelabel = {
    UJIAN_HARIAN: "Ujian Harian",
    UJIAN_TENGAH_SEMESTER: "Ujian Tengah Semester",
    UJIAN_AKHIR_SEMESTER: "Ujian Akhir Semester",
    PEKERJAAN_RUMAH: "Pekerjaan Rumah",
    TUGAS_AKHIR: "Tugas Akhir",
    TUGAS_HARIAN: "Tugas Harian",
  };

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
            title={data.student}
          >
            {data.student}
          </div>
          <div className="text-sm text-gray-600">Nilai: {data.score}</div>
          <div className="text-xs text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
            {data.selectedType} •{" "}
            {data.resultType
              ? resultTypelabel[data.resultType as resTypes]
              : "-"}
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
              Mata Pelajaran:{" "}
              <span className="font-normal">{data.subject}</span>
            </div>
            <div className="font-medium flex min-w-0">
              <span className="shrink-0">Guru :</span>
              <span className="font-normal overflow-hidden text-ellipsis whitespace-nowrap ml-1 min-w-0">
                {data.teacher}
              </span>
            </div>
            <div className="font-medium">
              Kelas: <span className="font-normal">{data?.class || "Tidak Ada Kelas"}</span>
            </div>
          </div>

          {(role === "admin" || allowedStaff) && (
            <div className="flex items-center gap-3 mt-4">
              {/* Update */}
              <div className="flex items-center gap-2">
                <FormModal
                  table="result"
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
                  table="result"
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
