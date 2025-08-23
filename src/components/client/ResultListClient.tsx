"use client";
import { useState } from "react";
import Table from "@/components/Table";
import BulkActions from "../BulkActions";
import ResultTableClient from "./ResultTableClient";
import { BaseListClientProps } from "./AssignmentListClient";
import TableSearch from "../TableSearch";
import FilterSortToggle from "../FilterSortToggle";
import FormModal from "../FormModal";

export default function ResultListClient({
  columns,
  data,
  role,
  relatedData,
  options,
  searchParams,
}: BaseListClientProps & { searchParams?: any }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [localData, setLocalData] = useState(data); // 👈 keep a client copy
  const normalizeResult = (item: any) => {
    const source = item.exam ?? item.assignment;
    const lesson = source?.lesson;

    const isExam = !!item.exam;

    return {
      id: item.id,
      title: source?.title || "-",
      subject: lesson?.subject?.name || "-",
      studentId: item.studentId || "",
      student: item.student
        ? `${item.student.name} ${item.student.namalengkap}`
        : "-",
      teacher: lesson?.teacher
        ? `${lesson.teacher.name} ${lesson.teacher.namalengkap}`
        : "-",
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

  const { classOptions = [], gradeOptions = [] } = options || {};
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
  console.log("searchParams", searchParams);

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
            {(role === "admin" || role === "teacher") && (
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
          <ResultTableClient
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
