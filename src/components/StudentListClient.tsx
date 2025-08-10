"use client";
import { useState } from "react";
import StudentTableClient from "./StudentTableClient";
import Table from "@/components/Table";
import BulkActions from "./BulkActions";
// import UpdateManyStudentForm from "./UpdateManyStudentForm";
// import DeleteManyModal from "./DeleteManyModal";

export default function StudentListClient({
  columns,
  students,
  role,
  relatedData,
}: {
  students: any[];
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
        table="student"
        onReset={() => setSelected([])}
        data={students}
        relatedData={relatedData}
      />

      <Table columns={columns}>
        <tr className="text-left text-gray-500 text-sm">
          {role === "admin" && (
            <td className="px-4 py-2">
              <input
                type="checkbox"
                checked={selected.length === students.length}
                onChange={(e) =>
                  setSelected(e.target.checked ? students.map((s) => s.id) : [])
                }
              />
            </td>
          )}
          {/* other headers */}
        </tr>
        {students.map((student) => (
          <StudentTableClient
            key={student.id}
            student={student}
            role={role}
            selected={selected}
            onToggle={toggleSelection}
          />
        ))}
      </Table>
    </div>
  );
}
