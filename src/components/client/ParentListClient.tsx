"use client";
import { useState } from "react";
import Table from "@/components/Table";
import BulkActions from "../BulkActions";
import ParentTableClient from "./ParentTableClient";
import { BaseListClientProps } from "./AssignmentListClient";
import TableSearch from "../TableSearch";
import FilterSortToggle from "../FilterSortToggle";
import FormModal from "../FormModal";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { MobileParentCard } from "./MobileParentCard";

export default function ParentListClient({
  columns,
  data,
  role,
  relatedData,
  options,
}: BaseListClientProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [localData, setLocalData] = useState(data); // 👈 keep a client copy
  const isMobile = useMediaQuery("(max-width: 768px)");
  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const handleDeleteOptimistic = (ids: (string | number)[]) => {
    setLocalData((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSelected([]); // reset selection
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
  const handleManyChanged = (items: any[]) => {
    setLocalData((prev) =>
      prev.map((p) => {
        const updated = items.find((u) => u.id === p.id);
        return updated ? { ...p, ...updated } : p;
      })
    );
  };

  const { classOptions = [], gradeOptions = [] } = options || {};

  return (
    <div className="space-y-4 mt-3">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Semua Wali Murid
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch></TableSearch>
          <div className="flex items-center gap-4 self-end">
            {role === "admin" && (
              <FormModal
                table="parent"
                type="create"
                relatedData={relatedData}
                onChanged={handleChanged}
              ></FormModal>
            )}
            <FilterSortToggle
              filterFields={[
                {
                  name: "classId",
                  label: "Kelas",
                  options: classOptions,
                },
                {
                  name: "gradeId",
                  label: "Tingkat",
                  options: gradeOptions,
                },
              ]}
              sortOptions={[
                { label: "A-Z", value: "az" },
                { label: "Z-A", value: "za" },
                { label: "ID Asc", value: "id_asc" },
                { label: "ID Desc", value: "id_desc" },
              ]}
            />
          </div>
        </div>
      </div>
      <BulkActions
        selectedIds={selected}
        table="parent"
        onReset={() => setSelected([])}
        data={data}
        relatedData={relatedData}
        onDeleted={handleDeleteOptimistic}
        handleChanged={handleChanged}
        handleManyChanged={handleManyChanged}
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
              <MobileParentCard
                key={row.id}
                data={row}
                selected={selected}
                onToggle={toggleSelection}
                relatedData={relatedData}
                onDeleted={handleDeleteOptimistic}
                onChanged={handleChanged}
                role={role}
              />
            ))
          )}
        </div>
      ) : (
        <Table columns={columns}>
          <tr className="text-left text-gray-500 text-sm">
            {role === "admin" && (
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selected.length === data.length}
                  onChange={(e) =>
                    setSelected(e.target.checked ? data.map((s) => s.id) : [])
                  }
                />
              </td>
            )}
            {/* other headers */}
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
              <ParentTableClient
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
