"use client";
import Link from "next/link";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";
import Image from "next/image";

export default function LessonTableClient({
  data,
  role,
  selected,
  onToggle,
  relatedData,
  onDeleted,
  onChanged,
}: BaseTableClientProps) {
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
          {data.teacher
            ? `${data.teacher.name} ${data.teacher.namalengkap}`
            : "Tidak ada guru"}
        </td>
        <td>
          <Link href={`/list/attendance/${data.class.name}/${data.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full">
              <Image src="/moreDark.png" alt="" width={16} height={16} />
            </button>
          </Link>
        </td>
        <td>
          <div className="flex items-center gap-2">
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
      </tr>
    </>
  );
}
