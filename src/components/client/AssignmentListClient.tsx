"use client";
import { useState } from "react";
import Table from "@/components/Table";
import AssignmentTableClient from "./AssignmentTableClient";
import BulkActions from "../BulkActions";
import TableSearch from "../TableSearch";
import FilterSortToggle from "../FilterSortToggle";
import FormModal from "../FormModal";
export type BaseListClientProps = {
  data: any[];
  relatedData?: any;
  options?: any;
  role: string;
  columns: { header: string; accessor: string; className?: string }[];
};

export default function AssignmentListClient({
  columns,
  data,
  role,
  relatedData,
  options,
}: BaseListClientProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [localData, setLocalData] = useState(data); // 👈 keep a client copy

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

  const {
    classOptions = [],
    gradeOptions = [],
    teacherOptions = [],
  } = options || {};
  return (
    <div className="space-y-4 mt-3">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Semua Tugas</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch></TableSearch>
          <div className="flex items-center gap-4 self-end">
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
                {
                  name: "teacherId",
                  label: "Guru",
                  options: teacherOptions,
                },
              ]}
              sortOptions={[
                { label: "A-Z", value: "az" },
                { label: "Z-A", value: "za" },
                { label: "ID Asc", value: "id_asc" },
                { label: "ID Desc", value: "id_desc" },
                { label: "Deadline", value: "dl" },
              ]}
            />
            {(role === "admin" || role === "teacher") && (
              <FormModal
                table="assignment"
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
        table="assignment"
        onReset={() => setSelected([])}
        data={localData}
        relatedData={relatedData}
        onDeleted={handleDeleteOptimistic} // pass handler
        handleChanged={handleChanged}
        handleManyChanged={handleManyChanged}
      />
      {/* LIST */}
      <Table columns={columns}>
        <tr key="header" className="text-left text-gray-500 text-sm">
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
        {localData.map((row) => (
          <AssignmentTableClient
            key={row.id}
            data={row}
            role={role}
            selected={selected}
            onToggle={toggleSelection}
            relatedData={relatedData}
            onDeleted={handleDeleteOptimistic}
            onChanged={handleChanged}
          />
        ))}
      </Table>
    </div>
  );
}
