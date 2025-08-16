"use client";
import { useState } from "react";
import StudentTableClient from "./StudentTableClient";
import Table from "@/components/Table";
import BulkActions from "../BulkActions";
import { BaseListClientProps } from "./AssignmentListClient";

export default function StudentListClient({
  columns,
  data,
  role,
  relatedData,
  options,
}: BaseListClientProps) {
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
        table="student"
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
        {data.map((student) => (
          <StudentTableClient
            key={student.id}
            data={student}
            role={role}
            selected={selected}
            relatedData={relatedData}
            onToggle={toggleSelection}
          />
        ))}
      </Table>
    </div>
  );
}
