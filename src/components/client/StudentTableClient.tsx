"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";

export default function StudentTableClient({
  data,
  role,
  selected,
  onToggle,
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

        <td className="flex items-center p-4 gap-4">
          <Image
            src={data.img || "/noAvatar.png"}
            alt=""
            width={40}
            height={40}
            className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">{data.name}</h3>
            <p className="text-xs text-gray-500">{data.class.name}</p>
          </div>
        </td>
        <td className="hidden md:table-cell">{data.student_details.nisn}</td>
        <td className="hidden md:table-cell">{data.grade.level}</td>
        <td className="hidden md:table-cell">
          {data.student_details.noWA ?? data.phone}
        </td>
        <td className="hidden md:table-cell">{data.address}</td>
        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/students/${data.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                <Image src="/view.png" alt="" width={16} height={16} />
              </button>
            </Link>
            {role === "admin" && (
              <FormModal
                type="delete"
                table="student"
                id={data.id}
                onDeleted={() => onDeleted?.([data.id])}
              />
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
