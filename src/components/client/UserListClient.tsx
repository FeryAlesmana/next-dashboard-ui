"use client";

import { useState } from "react";
import Table from "@/components/Table";
import BulkActions from "@/components/BulkActions";
import { toast } from "react-toastify";
import Image from "next/image";
import FormModal from "../FormModal";
import Link from "next/link";

type User = {
  id: string;
  img: string;
  name: string;
  dbName: string;
  email: string;
  role: string | undefined;
  password: string;
};

export default function UserListClient({
  columns,
  rows,
  role,
  relatedData,
}: {
  columns: any[];
  rows: User[];
  role: string;
  relatedData: any;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [localData, setLocalData] = useState(rows);

  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteOptimistic = (ids: (string | number)[]) => {
    setLocalData((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSelected([]);
    toast.success(`Deleted ${ids.length} user(s)`);
  };

  return (
    <div className="space-y-3 mt-3">
      <BulkActions
        selectedIds={selected}
        table="user"
        onReset={() => setSelected([])}
        onDeleted={handleDeleteOptimistic}
        data={localData}
      />

      <Table columns={columns}>
        <tr className="text-left text-gray-500 text-sm">
          {role === "admin" && (
            <th className="px-4 py-2">
              <input
                type="checkbox"
                checked={selected.length === localData.length}
                onChange={(e) =>
                  setSelected(
                    e.target.checked ? localData.map((r) => r.id) : []
                  )
                }
              />
            </th>
          )}
        </tr>
        {localData.map((row) => (
          <tr
            key={row.id}
            className={`border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight ${
              selected.includes(row.id) ? "bg-blue-50" : ""
            }`}
          >
            {role === "admin" && (
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  onChange={() => toggleSelection(row.id)}
                />
              </td>
            )}
            <td className="flex items-center p-4 gap-4">
              <Image
                src={row.img || "/noAvatar.png"}
                alt=""
                width={40}
                height={40}
                className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <h3 className="font-semibold">{row.name}</h3>
                <p className="text-xs text-gray-500">{row.role}</p>
              </div>
            </td>
            <td className="hidden md:table-cell">{row.email}</td>
            <td className="hidden md:table-cell">{row.dbName}</td>
            <td>
              <div className="flex items-center gap-2">
                {/* 👁️ VIEW BUTTON LOGIC */}
                {row.role === "admin" ? (
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
                ) : row.dbName === "-" ? (
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
                ) : row.role === "parent" ? (
                  // Parent → redirect to /list/parents?search=dbName
                  <Link
                    href={`/list/parents?search=${encodeURIComponent(
                      row.dbName
                    )}`}
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
                  <Link href={`/list/${row.role}s/${row.id}`}>
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
                      id={row.id}
                      data={row}
                      relatedData={relatedData}
                    ></FormModal>
                    <FormModal
                      table="user"
                      type="delete"
                      id={row.id}
                      onDeleted={() => handleDeleteOptimistic([row.id])}
                    ></FormModal>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
