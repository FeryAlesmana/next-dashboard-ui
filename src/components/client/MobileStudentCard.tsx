"use client";
import { useState } from "react";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";
import { assTypes, exTypes, resTypes } from "@prisma/client";
import NameListPopover from "../NamePopover";
import Link from "next/link";
import Image from "next/image";

export function MobileStudentCard({
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
        {/* LEFT SIDE: Checkbox + Image + Text */}
        <div className="flex items-start min-w-0">
          {/* Checkbox */}
          {role === "admin" && (
            <input
              type="checkbox"
              checked={selected.includes(data.id)}
              onChange={() => onToggle(data.id)}
              className="mt-1 mr-3"
            />
          )}

          {/* Image + Text */}
          <div className="flex items-start gap-3 min-w-0">
            {/* Image */}
            <Image
              src={data.img || "/noAvatar.png"}
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />

            {/* Text */}
            <div className="flex flex-col min-w-0">
              <div
                className="font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
                title={data.name}
              >
                {data.name}
              </div>

              <p className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                {" "}
                NISN : {data.student_details?.nisn || "-"}
              </p>
              {/* <div className="text-sm text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                NISN : {data.student_details?.nisn || "-"}
              </div> */}
            </div>
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
              Kelas :{" "}
              <span className="font-normal">
                {data.class?.name || "-"} Tingkat : {data.grade?.level || "-"}
              </span>
            </div>
            <div className="font-medium">
              No. Telepon :{" "}
              <span className="font-normal">
                {data.student_details?.noWA ?? (data.phone || "-")}
              </span>
            </div>
            <div className="font-medium flex min-w-0">
              <span className="shrink-0"> Alamat :</span>
              <span className="font-normal overflow-hidden text-ellipsis whitespace-nowrap ml-1 min-w-0">
                {data.address}
              </span>
            </div>
            <div className="font-medium">
              Profile :{" "}
              <Link href={`/list/students/${data.id}`}>
                <button className="w-5 h-5 rounded-full ml-3 ">
                  <Image src="/morev.png" alt="" width={16} height={16} />
                </button>
              </Link>
            </div>
          </div>

          {role === "admin" && (
            <div className="flex items-center gap-3 mt-4">
              {/* Update */}
              <div className="flex items-center gap-2">
                <FormModal
                  table="teacher"
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
                  table="teacher"
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
