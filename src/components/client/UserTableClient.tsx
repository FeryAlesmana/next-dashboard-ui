"use client";
import Image from "next/image";
import Link from "next/link";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";

export default function UserTableClient({
  data,
  role,
  selected,
  onToggle,
  onDeleted,
  relatedData,
  onChanged,
}: BaseTableClientProps) {
  return (
    <>
      <tr
        key={data.id}
        className={`border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight ${
          selected.includes(data.id) ? "bg-blue-50" : ""
        }`}
      >
        {role === "admin" && (
          <td className="px-4 py-2">
            <input
              type="checkbox"
              checked={selected.includes(data.id)}
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
            <p className="text-xs text-gray-500">{data.role}</p>
          </div>
        </td>
        <td className="hidden md:table-cell">{data.email}</td>
        <td className="hidden md:table-cell">{data.dbName}</td>
        <td>
          <div className="flex items-center gap-2">
            {/* 👁️ VIEW BUTTON LOGIC */}
            {data.role === "admin" ? (
              // Admins → view disabled
              <button
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 cursor-not-allowed"
                title="Admin profile unavailable"
                disabled
              >
                <Image
                  src="/view.png"
                  alt=""
                  width={16}
                  height={16}
                  className="opacity-50"
                />
              </button>
            ) : data.dbName === "-" ? (
              // Any role with empty dbName → view disabled
              <button
                className="w-7 h-7 items-center justify-center rounded-full bg-gray-200 cursor-not-allowed hidden"
                title="Profile unavailable"
                disabled
              >
                <Image
                  src="/view.png"
                  alt=""
                  width={16}
                  height={16}
                  className="opacity-50"
                />
              </button>
            ) : data.role === "parent" ? (
              // Parent → redirect to /list/parents?search=dbName
              <Link
                href={`/list/parents?search=${encodeURIComponent(data.dbName)}`}
              >
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky shadow-lg hover:bg-lamaSky/80"
                  title="Profil User"
                >
                  <Image src="/view.png" alt="" width={16} height={16} />
                </button>
              </Link>
            ) : (
              // Teacher & Student → direct to /list/[role]s/[id]
              <Link href={`/list/${data.role}s/${data.id}`}>
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky shadow-lg hover:bg-lamaSky/80"
                  title="Profil User"
                >
                  <Image src="/view.png" alt="" width={16} height={16} />
                </button>
              </Link>
            )}
            {role === "admin" && (
              <>
                <FormModal
                  table="user"
                  type="update"
                  id={data.id}
                  data={data}
                  relatedData={relatedData}
                  onChanged={onChanged}
                ></FormModal>
                <FormModal
                  table="user"
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
