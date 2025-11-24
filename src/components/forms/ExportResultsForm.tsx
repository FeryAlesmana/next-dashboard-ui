"use client";

import {
  exportResultSchema,
  ExportResultSchema,
} from "@/lib/formValidationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Select from "react-select";
import { exportResultToExcel } from "@/lib/actions";
type SemesterOption = {
  label: string;
  value: string;
};

export default function ExportResultsForm({
  setOpen,
  relatedData,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: any;
}) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExportResultSchema>({
    resolver: zodResolver(exportResultSchema),
  });
  const initialState = {
    fileName: null,
    filePath: null,
    error: null,
  };
  const exportHandler = async (prev: any, data: ExportResultSchema) => {
    return await exportResultToExcel(prev, data);
  };

  const [state, formAction] = useActionState(exportHandler, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredSemesters, setFilteredSemesters] = useState<SemesterOption[]>(
    []
  );
  const [loadingSemesters, setLoadingSemesters] = useState(true);

  const router = useRouter();

  const { semesterOptions = [] } = relatedData || {};
  useEffect(() => {
    if (!relatedData?.semesterOptions) return;
    setLoadingSemesters(true);
    const original = relatedData.semesterOptions.map((sem: any) => ({
      start: sem.start.toISOString(),
      end: sem.end.toISOString(),
      label: sem.label,
    }));

    const fetchFiltered = async () => {
      const res = await fetch("/api/check-semester-data", {
        method: "POST",
        body: JSON.stringify({ semesters: original }),
      });

      const data = await res.json();

      if (data.success) {
        // Convert into react-select format
        const formatted = data.semesters.map((sem: any) => ({
          label: sem.label,
          value: JSON.stringify({
            start: sem.start,
            end: sem.end,
          }),
        }));

        setFilteredSemesters(formatted);
      }
      setLoadingSemesters(false);
    };

    fetchFiltered();
  }, [relatedData?.semesterOptions]);
  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
      setIsSubmitting(false);
    }
  }, [state.error]);
  useEffect(() => {
    if (state.success) {
      toast("✅ Export Nilai berhasil");

      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast(`❌ Export Nilai gagal: ${state.message}`);
    }
  }, [state, setOpen, router]);
  const handleSubmitForm = handleSubmit((data) => {
    setIsSubmitting(true);
    startTransition(() => {
      formAction(data);
    });
  });
  useEffect(() => {
    if (!state?.downloadUrl) return;
    console.log("Downloading from:", state.downloadUrl);
    const a = document.createElement("a");
    a.href = state.downloadUrl;
    a.download = state.fileName || "export.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [state]);

  const semesterSelect = semesterOptions.map((sem: any) => ({
    label: sem.label,
    value: JSON.stringify({
      start: sem.start.toISOString(),
      end: sem.end.toISOString(),
    }),
  }));
  return (
    <form
      onSubmit={handleSubmitForm}
      className="p-4 border rounded-md space-y-4 text-sm"
    >
      <div className="text-xl font-semibold">Export Nilai</div>
      <div className="w-full rounded p-2">
        <label className="text-xs text-gray-400">Semester</label>

        <Controller
          name="semester"
          control={control}
          render={({ field }) => {
            return (
              <Select
                {...field}
                options={filteredSemesters}
                className="text-sm"
                classNamePrefix="select"
                placeholder="Pilih Semester..."
                isDisabled={loadingSemesters}
                isLoading={loadingSemesters}
                onChange={(selectedOption) =>
                  field.onChange(selectedOption?.value)
                }
                value={
                  filteredSemesters.find(
                    (opt: { value: string; label: string }) =>
                      opt.value === field.value
                  ) || null
                }
              />
            );
          }}
        />

        {errors.semester?.message && (
          <p className="text-xs text-red-400">
            {errors.semester.message.toString()}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full mr-2"></span>
        )}
        {isSubmitting ? "Memproses..." : "Export Nilai"}
      </button>

      {state?.error && <p className="text-red-600">{state.error}</p>}
    </form>
  );
}
