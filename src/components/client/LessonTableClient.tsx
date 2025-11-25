"use client";
import Link from "next/link";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";
import Image from "next/image";
import { useState } from "react";
import MobileMenu from "../MobileMenu";

export default function LessonTableClient({
  data,
  role,
  selected,
  onToggle,
  relatedData,
  onDeleted,
  onChanged,
  allowedStaff,
}: BaseTableClientProps) {
  const [open, setOpend] = useState(false);
  function toNormalCase(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return (
    <>
      <tr className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
        {allowedStaff && (
          <td className="px-4 py-2">
            <input
              type="checkbox"
              checked={selected?.includes(data.id)}
              onChange={() => onToggle(data.id)}
            />
          </td>
        )}
        <td className="hidden md:table-cell items-center p-4 gap-4">
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
        <td className="hidden md:table-cell">{toNormalCase(data.day)}</td>
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
            {allowedStaff && (
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
            <MobileMenu
              table="lesson"
              onClose={() => setOpend(false)}
              data={data}
              role={role}
              relatedData={relatedData}
              onChanged={onChanged}
              onDeleted={onDeleted}
            />
          )}
        </td>
      </tr>
    </>
  );
}
