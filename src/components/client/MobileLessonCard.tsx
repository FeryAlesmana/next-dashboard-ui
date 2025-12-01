"use client";
import { useState } from "react";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";
import { assTypes, exTypes, resTypes } from "@prisma/client";
import NameListPopover from "../NamePopover";
import Link from "next/link";
import Image from "next/image";

export function MobileLessonCard({
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
  function toNormalCase(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between min-w-0">
        {/* Checkbox */}
        {allowedStaff && (
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
            title={data.subject?.name || "-"}
          >
            {data.subject?.name || "-"}
          </div>
          <div className="text-sm text-gray-600">Kelas : {data.class.name}</div>
          <div className="text-xs text-gray-400">
            Waktu Mulai :{" "}
            {data.startTime.toLocaleTimeString("id-ID", {
              timeZone: "Asia/Jakarta",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </div>
          <div className="text-xs text-gray-400">
            Waktu Selesai :{" "}
            {data.endTime.toLocaleTimeString("id-ID", {
              timeZone: "Asia/Jakarta",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
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
              Hari :{" "}
              <span className="font-normal">{toNormalCase(data.day)}</span>
            </div>
            <div className="font-medium">
              Guru :{" "}
              <span className="font-normal">
                {data.teacher ? `${data.teacher.name} ` : "Tidak ada guru"}
              </span>
            </div>
            <div className="font-medium">
              Pertemuan :{" "}
              <Link href={`/list/attendance/${data.class.name}/${data.id}`}>
                <button className="w-5 h-5 rounded-full ml-3">
                  <Image src="/moreDark.png" alt="" width={16} height={16} />
                </button>
              </Link>
            </div>
          </div>

          {allowedStaff && (
            <div className="flex items-center gap-3 mt-4">
              {/* Update */}
              <div className="flex items-center gap-2">
                <FormModal
                  table="lesson"
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
                  table="lesson"
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
