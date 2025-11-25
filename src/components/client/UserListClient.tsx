"use client";

import { useState } from "react";
import Table from "@/components/Table";
import BulkActions from "@/components/BulkActions";
import { toast } from "react-toastify";
import Image from "next/image";
import FormModal from "../FormModal";
import Link from "next/link";
import UserTableClient from "./UserTableClient";
import TableSearch from "../TableSearch";
import FilterSortToggle from "../FilterSortToggle";
import { MobileUserCard } from "./MobileUserCard";
import { useMediaQuery } from "@/lib/useMediaQuery";

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

  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleChanged = (item: any) => {
    setLocalData((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) {
        // update existing
        return prev.map((p) => (p.id === item.id ? { ...p, ...item } : p));
      } else {
        // append new
        return [...prev, item];
      }
    });
  };

  const handleDeleteOptimistic = (ids: (string | number)[]) => {
    setLocalData((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSelected([]);
    toast.success(`Deleted ${ids.length} user(s)`);
  };

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Semua Pengguna
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterSortToggle
              filterFields={[
                {
                  name: "search",
                  label: "Role",
                  options: [
                    { label: "Admin", value: "admin" },
                    { label: "Guru", value: "teacher" },
                    { label: "Murid", value: "student" },
                    { label: "Wali Murid", value: "parent" },
                  ],
                },
              ]}
              sortOptions={[
                { label: "A-Z", value: "az" },
                { label: "Z-A", value: "za" },
                { label: "ID Asc", value: "id_asc" },
                { label: "ID Desc", value: "id_desc" },
              ]}
              hideperPage={true}
            />

            {role === "admin" && (
              <FormModal
                table="user"
                type="create"
                relatedData={relatedData}
                onChanged={handleChanged}
              ></FormModal>
            )}
          </div>
        </div>
      </div>
      <BulkActions
        selectedIds={selected}
        table="user"
        onReset={() => setSelected([])}
        onDeleted={handleDeleteOptimistic}
        data={localData}
      />

      {isMobile ? (
        // MOBILE VIEW

        <div className="space-y-3">
          {localData.length === 0 ? (
            <div className=" p-4">
              <div className="text-gray-500 text-sm text-center py-6">
                Tidak ada data untuk table ini
              </div>
            </div>
          ) : (
            localData.map((row) => (
              <MobileUserCard
                key={row.id}
                data={row}
                selected={selected}
                onToggle={toggleSelection}
                relatedData={relatedData}
                onDeleted={handleDeleteOptimistic}
                onChanged={handleChanged}
                role={role}
                allowedStaff={allowedStaff}
              />
            ))
          )}
        </div>
      ) : (
        // DESKTOP TABLE VIEW
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
        {localData.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length + (role === "admin" ? 1 : 0)}
              className="text-center text-gray-500 py-6"
            >
              Tidak ada data untuk table ini
            </td>
          </tr>
        ) : (
          localData.map((row) => (
            <UserTableClient
              key={row.id}
              data={row}
              role={role}
              selected={selected}
              onToggle={toggleSelection}
              relatedData={relatedData}
              onDeleted={handleDeleteOptimistic}
              onChanged={handleChanged}
            />
          ))
        )}
      </Table>
      )}
    </div>
  );
}
