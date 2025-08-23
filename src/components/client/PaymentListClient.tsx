"use client";
import { useState } from "react";
import Table from "@/components/Table";
import PaymentTableClient from "./PaymentTableClient";
import BulkActions from "../BulkActions";
import { BaseListClientProps } from "./AssignmentListClient";
import FormModal from "../FormModal";
import TableSearch from "../TableSearch";
import FilterSortToggle from "../FilterSortToggle";

export default function PaymentListClient({
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
  const handleChanged = (items: any | any[]) => {
    const newItems = Array.isArray(items) ? items : [items]; // normalize to array

    setLocalData((prev) => {
      const updated = [...prev];

      newItems.forEach((item) => {
        const index = updated.findIndex((p) => p.id === item.id);

        if (index !== -1) {
          // update existing row
          updated[index] = { ...updated[index], ...item };
        } else {
          // add new row
          updated.push(item);
        }
      });

      return updated;
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
    pStatusOptions = [],
  } = options || {};

  console.log(relatedData, "relatedData di payment list client");

  return (
    <div className="space-y-4 mt-3">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Log Pembayaran
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
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
                  name: "status",
                  label: "Status Pembayaran",
                  options: pStatusOptions,
                },
              ]}
              sortOptions={[
                { label: "Tipe Pembayaran", value: "pt" },
                { label: "Tenggat waktu", value: "tw" },
                { label: "ID Asc", value: "id_asc" },
                { label: "ID Desc", value: "id_desc" },
              ]}
            />

            {role === "admin" && (
              <FormModal
                table="paymentLog"
                type="create"
                onChanged={handleChanged}
                relatedData={relatedData}
              />
            )}
          </div>
        </div>
      </div>
      <BulkActions
        selectedIds={selected}
        table="paymentLog"
        onReset={() => setSelected([])}
        data={data}
        relatedData={relatedData}
        handleChanged={handleChanged}
        handleManyChanged={handleManyChanged}
        onDeleted={handleDeleteOptimistic}
      />

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
        {localData.map((row) => (
          <PaymentTableClient
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
