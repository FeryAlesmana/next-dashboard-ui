"use client";
import Image from "next/image";
import Link from "next/link";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";

export default function PaymenTableClient({
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

        <td className="flex items-center p-4 gap-4">
          <Image
            src={data.student.img || "/noAvatar.png"}
            alt=""
            width={40}
            height={40}
            className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">{data.student.name}</h3>
            <p className="text-xs text-gray-500">
              {data.student.class?.name || "—"}
            </p>
          </div>
        </td>
        <td className="hidden md:table-cell">
          {data.student.student_details?.nisn || "—"}
        </td>
        <td>{data.paymentType}</td>
        <td className="hidden md:table-cell">
          {data.amount.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
        </td>
        <td className="hidden md:table-cell">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium
              ${
                data.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : ""
              }
              ${data.status === "PAID" ? "bg-green-100 text-green-800" : ""}
              ${data.status === "OVERDUE" ? "bg-red-100 text-red-800" : ""}
              ${
                data.status === "PARTIALLY_PAID"
                  ? "bg-blue-100 text-blue-800"
                  : ""
              }
            `}
          >
            {data.status === "PENDING" && "Belum Dibayar"}
            {data.status === "PAID" && "Lunas"}
            {data.status === "OVERDUE" && "Terlambat"}
            {data.status === "PARTIALLY_PAID" && "Dibayar Sebagian"}
          </span>
        </td>
        <td className="hidden md:table-cell">
          {data.dueDate.toLocaleDateString("en-UK", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })}
        </td>
        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal type="delete" table="paymentLog" id={data.id} />
                <FormModal
                  type="update"
                  table="paymentLog"
                  id={data.id}
                  data={data}
                  relatedData={relatedData}
                />
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
