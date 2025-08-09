"use client";
import { useState } from "react";
import Table from "@/components/Table";
import BulkActions from "./BulkActions";
import ParentTableClient from "./ParentTableClient";
// import UpdateManyParentForm from "./UpdateManyParentForm";
// import DeleteManyModal from "./DeleteManyModal";

export default function ParentListClient({
  columns,
  data,
  role,
  relatedData,
}: {
  data: any[];
  relatedData?: any;
  role: string;
  columns: { header: string; accessor: string; className?: string }[];
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4 mt-3">
      <BulkActions
        selectedIds={selected}
        table="parent"
        onReset={() => setSelected([])}
        data={data}
        relatedData={relatedData}
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
        {data.map((data) => (
          <ParentTableClient
            key={data.id}
            data={data}
            role={role}
            selected={selected}
            onToggle={toggleSelection}
            relatedData={relatedData}
          />
        ))}
      </Table>
    </div>
  );
}
