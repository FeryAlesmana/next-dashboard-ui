"use client";
import Link from "next/link";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";
import Image from "next/image";
import { useState } from "react";

export default function LessonTableClient({
  data,
  role,
  selected,
  onToggle,
  relatedData,
  onDeleted,
  onChanged,
}: BaseTableClientProps) {
  const [open, setOpend] = useState(false);

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

        <td className="hidden md:table-cell">{data?.id}</td>
        <td className="flex items-center p-4 gap-4">
          {data.subject?.name || "-"}
        </td>
        <td className="hidden md:table-cell">{data.class.name}</td>
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
        <td>{data.day}</td>
        <td className="hidden md:table-cell">
          {data.teacher ? `${data.teacher.name} ` : "Tidak ada guru"}
        </td>
        <td className="hidden md:table-cell">
          <Link href={`/list/attendance/${data.class.name}/${data.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full">
              <Image src="/moreDark.png" alt="" width={16} height={16} />
            </button>
          </Link>
        </td>
        <td className="hidden md:table-cell">
          <div className="flex items-center gap-2 ">
            {role === "admin" && (
              <>
                <FormModal
                  table="lesson"
                  type="update"
                  data={data}
                  relatedData={relatedData}
                  onChanged={onChanged}
                ></FormModal>
                <FormModal
                  table="lesson"
                  type="delete"
                  id={data.id}
                  onDeleted={() => onDeleted?.([data.id])}
                ></FormModal>
              </>
            )}
          </div>
        </td>
        {/* MOBILE VIEW */}
        <td className="relative md:hidden">
          <button
            onClick={() => setOpend(!open)}
            className="w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-200"
          >
            <Image src="/morev.png" alt="" width={16} height={16} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-20 bg-white shadow-md border rounded-md p-1 z-10">
              {/* View Attendance */}
              <Link
                href={`/list/attendance/${data.class.name}/${data.id}`}
                className="block px-3 py-2 text-sm hover:bg-gray-100 rounded"
                onClick={() => setOpend(false)}
              >
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky shadow-lg">
                  <Image src="/view.png" alt="" width={16} height={16} />
                </button>
              </Link>

              {role === "admin" && (
                <>
                  {/* Update */}
                  <div className="px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                    <FormModal
                      table="lesson"
                      type="update"
                      data={data}
                      relatedData={relatedData}
                      onChanged={onChanged}
                    />
                  </div>

                  {/* Delete */}
                  <div className="px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                    <FormModal
                      table="lesson"
                      type="delete"
                      id={data.id}
                      onDeleted={() => onDeleted?.([data.id])}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </td>
      </tr>
    </>
  );
}
