"use client";
import { useState } from "react";
import Table from "@/components/Table";
import BulkActions from "../BulkActions";
import ResultTableClient from "./ResultTableClient";
import { BaseListClientProps } from "./AssignmentListClient";
import TableSearch from "../TableSearch";
import FilterSortToggle from "../FilterSortToggle";
import FormModal from "../FormModal";
import { Semester } from "./StudentPaymentView";
import { staffrole } from "@prisma/client";

export default function ResultListClient({
  columns,
  data,
  role,
  relatedData,
  options,
  searchParams,
  staffrole,
}: BaseListClientProps & { searchParams?: any }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [localData, setLocalData] = useState(data); // 👈 keep a client copy
  const [currentStaff] = useState<staffrole>(staffrole!);
  const normalizeResult = (item: any) => {
    const source = item.exam ?? item.assignment;
    const lesson = source?.lesson;

    const isExam = !!item.exam;

    return {
      id: item.id,
      title: source?.title || "-",
      subject: lesson?.subject?.name || "-",
      studentId: item.studentId || "",
      student: item.student ? `${item.student.name} ` : "-",
      teacher: lesson?.teacher ? `${lesson.teacher.name} ` : "-",
      score: item.score,
      class: lesson?.class?.name || "-",
      selectedType: isExam ? "Ujian" : "Tugas",
      examId: item.examId || undefined,
      assignmentId: item.assignmentId || undefined,
      resultType: item.resultType || "",
    };
  };

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
    const normalized = normalizeResult(item);

    setLocalData((prev) => {
      const exists = prev.find((p) => p.id === normalized.id);
      if (exists) {
        return prev.map((p) =>
          p.id === normalized.id ? { ...p, ...normalized } : p
        );
      } else {
        return [...prev, normalized];
      }
    });
  };

  const handleManyChanged = (items: any[]) => {
    const normalizedItems = items.map(normalizeResult);

    setLocalData((prev) =>
      prev.map((p) => {
        const updated = normalizedItems.find((u) => u.id === p.id);
        return updated ? { ...p, ...updated } : p;
      })
    );
  };

  const {
    classOptions = [],
    gradeOptions = [],
    semesterOptions = [],
  } = options || {};
  const selectedType = searchParams?.stype || "";
  const sTypeOptions = [
    { label: "Semua", value: "" },
    { label: "Ujian", value: "Ujian" },
    { label: "Tugas", value: "Tugas" },
  ];
  const ujianOptions = [
    { label: "Semua", value: "" },
    { label: "Ujian Harian", value: "harian" },
    { label: "Ujian Tengah Semester", value: "uts" },
    { label: "Ujian Akhir Semester", value: "uas" },
  ];
  const tugasOptions = [
    { label: "Semua", value: "" },
    { label: "Tugas Harian", value: "tharian" },
    { label: "Pekerjaan Rumah", value: "pr" },
    { label: "Tugas Akhir", value: "ta" },
  ];
  const allowedStaff = role === "staff" && currentStaff === "PENILAIAN";
  const allowedRole = role === "admin" || role === "teacher" || allowedStaff;
  return (
    <div className="space-y-4 mt-3">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Semua Nilai</h1>
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
                  name: "stype",
                  label: "Tipe",
                  options: sTypeOptions,
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
                ...(selectedType === "Ujian"
                  ? [
                      {
                        name: "extype",
                        label: "Ujian",
                        options: ujianOptions,
                      },
                    ]
                  : selectedType === "Tugas"
                  ? [
                      {
                        name: "asstype",
                        label: "Tugas",
                        options: tugasOptions,
                      },
                    ]
                  : []),
              ]}
              sortOptions={[
                { label: "A-Z", value: "az" },
                { label: "Z-A", value: "za" },
                { label: "ID Asc", value: "id_asc" },
                { label: "ID Desc", value: "id_desc" },
              ]}
            />
            {allowedRole && (
              <FormModal
                table="result"
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
        table="result"
        onReset={() => setSelected([])}
        data={data}
        relatedData={relatedData}
        onDeleted={handleDeleteOptimistic}
        handleChanged={handleChanged}
        handleManyChanged={handleManyChanged}
      />

      <Table columns={columns}>
        <tr className="text-left text-gray-500 text-sm">
          {(role === "admin" || allowedStaff) && (
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
            <ResultTableClient
              key={row.id}
              data={row}
              role={role}
              selected={selected}
              onToggle={toggleSelection}
              relatedData={relatedData}
              onDeleted={handleDeleteOptimistic}
              onChanged={handleChanged}
              allowedStaff={allowedStaff}
            />
          ))
        )}
      </Table>
    </div>
  );
}
