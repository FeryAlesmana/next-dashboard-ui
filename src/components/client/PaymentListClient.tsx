"use client";
import { useState } from "react";
import Table from "@/components/Table";
import BulkActions from "../BulkActions";
import { BaseListClientProps } from "./AssignmentListClient";
import FormModal from "../FormModal";
import TableSearch from "../TableSearch";
import FilterSortToggle from "../FilterSortToggle";
import PaymenTableClient from "./PaymentTableClient";
import Link from "next/link";
import Image from "next/image";

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

  const handleManyImport = (newItems: any[]) => {
    setLocalData((prev) => {
      const updated = [...prev];

      newItems.forEach((item) => {
        const index = updated.findIndex((p) => p.id === item.id);
        if (index > -1) {
          updated[index] = item; // update existing
        } else {
          updated.unshift(item); // add new
        }
      });

      return updated;
    });
  };

  const {
    classOptions = [],
    gradeOptions = [],
    pStatusOptions = [],
    paymentTypeOptions = [],
    semesterOptions = [],
  } = options || {};

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
                {
                  name: "paymentType",
                  label: "Tipe Pembayaran",
                  options: paymentTypeOptions,
                },
                {
                  name: "semester",
                  label: "Semester",
                  options: semesterOptions.map((sem: any) => ({
                    label: sem.label,
                    value: JSON.stringify({
                      start: sem.start.toISOString(),
                      end: sem.end.toISOString(),
                    }),
                  })),
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
              <>
                <FormModal
                  table="paymentLog"
                  type="create"
                  onChanged={handleChanged}
                  relatedData={relatedData}
                />
                <FormModal
                  table="importPayments"
                  type="createMany"
                  onChanged={handleManyImport}
                />
                <FormModal
                  table="exportPayments"
                  type="readMany"
                  onChanged={handleManyImport}
                />
                <Link href={`payment/changelog`}>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow shadow-md">
                    <Image src="/changelog.png" alt="" width={16} height={16} />
                  </button>
                </Link>
              </>
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
            <PaymenTableClient
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
    </div>
  );
}
