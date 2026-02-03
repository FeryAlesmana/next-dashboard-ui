"use client";
import { useState } from "react";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";
import NameListPopover from "../NamePopover";

export function MobileClassesCard({
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

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between">
        {/* Checkbox */}
        {(role === "admin" || allowedStaff) && (
          <input
            type="checkbox"
            checked={selected.includes(data.id)}
            onChange={() => onToggle(data.id)}
            className="mt-1"
          />
        )}

        <div className="ml-3 flex-1">
          <div
            className="font-medium max-w-full md:max-w-[300px] 
                           overflow-hidden text-ellipsis whitespace-nowrap"
            title={data.name}
          >
            Kelas : {data.name}
          </div>
          <div className="text-sm text-gray-600">
            Kapasitas :{" "}
            {data._count?.students !== undefined
              ? `${data._count.students}/${data.capacity ?? 0}`
              : `0/${data.capacity ?? 0}`}
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
              Murid :{" "}
              <span className="font-normal">
                <NameListPopover
                  items={data.students.map((student: any) => ({
                    id: student.id,
                    img: student.img,
                    name: student.name,
                    className: student.class?.name || "Tidak Ada Kelas",
                  }))}
                  label="Murid"
                />
              </span>
            </div>
            <div className="font-medium">
              Tingkat : <span className="font-normal">{data.grade.level}</span>
            </div>
            <div className="font-medium flex min-w-0">
              <span className="shrink-0"> Wali Kelas :</span>
              <span className="font-normal overflow-hidden text-ellipsis whitespace-nowrap ml-1 min-w-0">
                {" "}
                {data.supervisor
                  ? `${data.supervisor.name ?? ""} `.trim()
                  : "-"}
              </span>
            </div>
          </div>

          {allowedStaff && (
            <div className="flex items-center gap-3 mt-4">
              {/* Update */}
              <div className="flex items-center gap-2">
                <FormModal
                  table="class"
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
                  table="class"
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
