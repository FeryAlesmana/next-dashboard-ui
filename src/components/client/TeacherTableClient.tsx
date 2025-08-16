"use client";
import Image from "next/image";
import Link from "next/link";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";

export default function TeacherTableClient({
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
          ></Image>
          <div className="flex flex-col">
            <h3 className="font-semibold">{data.name}</h3>
            <p className="text-xs text-gray-500">{data?.email || "-"}</p>
          </div>
        </td>
        <td className="hidden md:table-cell">{data.username}</td>
        <td className="hidden md:table-cell">
          {data.subjects
            .map((subject: { name: string }) => subject.name)
            .join(",") || "-"}
        </td>
        <td className="hidden md:table-cell">
          {data.classes
            .map((classdata: { name: string }) => classdata.name)
            .join(",") || "-"}
        </td>
        <td className="hidden md:table-cell">{data.phone}</td>
        <td className="hidden md:table-cell">{data.address}</td>
        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/teachers/${data.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                <Image src="/view.png" alt="" width={16} height={16}></Image>
              </button>
            </Link>
            {role === "admin" && (
              <FormModal table="teacher" type="delete" id={data.id}></FormModal>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
