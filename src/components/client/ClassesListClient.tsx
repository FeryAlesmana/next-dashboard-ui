"use client";
import Image from "next/image";
import TableSearch from "../TableSearch";
import { BaseListClientProps } from "./AssignmentListClient";
import { useState } from "react";
import BulkActions from "../BulkActions";
import Table from "@/components/Table";
import FormModal from "../FormModal";
import ClassesTableClient from "./ClassesTableClient";
import FilterSortToggle from "../FilterSortToggle";
const ClassesListClient = ({
  columns,
  data,
  role,
  relatedData,
  options,
}: BaseListClientProps) => {
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
    capacityOptions = [],
    gradeOptions = [],
    teacherOptions = [],
  } = options || {};
  return (
    <div className="space-y-4 mt-3">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Semua Kelas</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch></TableSearch>
          <div className="flex items-center gap-4 self-end">
            <FilterSortToggle
              filterFields={[
                {
                  name: "capacity",
                  label: "Kapasitas",
                  options: capacityOptions,
                },
                {
                  name: "gradeId",
                  label: "Tingkat",
                  options: gradeOptions,
                },
                {
                  name: "supervisorId",
                  label: "Guru",
                  options: teacherOptions,
                },
              ]}
              sortOptions={[
                { label: "A-Z", value: "az" },
                { label: "Z-A", value: "za" },
                { label: "ID Asc", value: "id_asc" },
                { label: "ID Desc", value: "id_desc" },
                { label: "Kapasitas Asc", value: "cp_asc" },
                { label: "Kapasitas Desc", value: "cp_desc" },
              ]}
            />
            {role === "admin" && (
              <FormModal
                table="class"
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
        table="class"
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
          <ClassesTableClient
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
};

export default ClassesListClient;
