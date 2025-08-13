"use client";

import { mresultSchema, MresultSchema } from "@/lib/formValidationSchema";
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
import { updateResults } from "@/lib/actions"; // make sure this is defined
import InputField from "../InputField";
import Select from "react-select";
import { assTypes, exTypes, resTypes } from "@prisma/client";

type UpdateManyResultsFormProps = {
  ids?: number[];
  table: string;
  data?: any;
  relatedData?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const UpdateManyResultsForm = ({
  ids,
  table,
  data,
  relatedData,
  setOpen,
}: UpdateManyResultsFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<MresultSchema>({
    resolver: zodResolver(mresultSchema),
    defaultValues: {
      ids,
    },
  });
  console.log(data, "isi data di UpdateResults");

  const initialState = { success: false, error: false, message: "" };
  const [state, formAction] = useActionState(updateResults, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<"Ujian" | "Tugas" | "">(
    data?.examId ? "Ujian" : data?.assignmentId ? "Tugas" : ""
  );
  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  useEffect(() => {
    setValue("selectedType", selectedType);
    if (state.success) {
      toast("Berhasil memperbarui siswa.");
      setOpen(false);
      router.refresh();
    }
  }, [state.success, setOpen, router, setValue, selectedType]);

  if (!ids || ids.length === 0) {
    return <span>Tidak ada data yang dipilih.</span>;
  }

  const onSubmit = handleSubmit((formData) => {
    setIsSubmitting(true);
    startTransition(() => {
      formAction(formData);
    });
  });

  const { exams = [], assignments = [] } = relatedData ?? {};
  const examOption = exams.map(
    (exam: { id: number; title: string; exType: exTypes }) => ({
      value: exam.id,
      label: `${exam.title} ${exam.exType}`,
    })
  );
  const assOption = assignments.map(
    (ass: { id: number; title: string; assType: assTypes }) => ({
      value: ass.id,
      label: `${ass.title} ${ass.assType}`,
    })
  );

  return (
    <form onSubmit={onSubmit} className="p-4 flex flex-col gap-4">
      <input type="hidden" name="table" value={table} />
      {ids.map((id) => (
        <input key={id} type="hidden" value={id} {...register("ids")} />
      ))}
      <span className="text-center font-medium">
        {ids.length} Nilai akan diperbarui.
      </span>
      <InputField
        label="Nilai (Score)"
        name="score"
        type="number"
        register={register}
        error={errors?.score}
        placeholder="0 - 100"
      />

      <div className="flex flex-col gap-2 w-full md:w-1/4">
        <label className="text-xs text-gray-400">Jenis Penilaian</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          value={selectedType}
          onChange={(e) =>
            setSelectedType(e.target.value as "" | "Ujian" | "Tugas")
          }
        >
          <option value="">-- Pilih Jenis --</option>
          <option value="Ujian">Ujian</option>
          <option value="Tugas">Tugas</option>
        </select>
      </div>

      {selectedType === "Ujian" && (
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Ujian</label>

          <Controller
            name="examId"
            control={control}
            defaultValue={data?.examId || ""}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  options={examOption}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari Ujian..."
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={
                    examOption.find(
                      (opt: { value: number; label: string }) =>
                        opt.value === field.value
                    ) || null
                  }
                />
              );
            }}
          />

          {errors.examId?.message && (
            <p className="text-xs text-red-400">
              {errors.examId.message.toString()}
            </p>
          )}
        </div>
      )}

      {selectedType === "Tugas" && (
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Tugas</label>

          <Controller
            name="assignmentId"
            control={control}
            defaultValue={data?.assignmentId || ""}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  options={assOption}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari Tugas..."
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={
                    assOption.find(
                      (opt: { value: number; label: string }) =>
                        opt.value === field.value
                    ) || null
                  }
                />
              );
            }}
          />

          {errors.assignmentId?.message && (
            <p className="text-xs text-red-400">
              {errors.assignmentId.message.toString()}
            </p>
          )}
        </div>
      )}

      {selectedType.length > 0 && (
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Tipe Nilai</label>

          <Controller
            name="resultType"
            control={control}
            defaultValue={data?.resultType || ""}
            render={({ field }) => {
              const examTypes = [
                "UJIAN_HARIAN",
                "UJIAN_TENGAH_SEMESTER",
                "UJIAN_AKHIR_SEMESTER",
              ];

              const assignmentTypes = [
                "TUGAS_HARIAN",
                "TUGAS_AKHIR",
                "PEKERJAAN_RUMAH",
              ];

              const resultOption = Object.entries(resTypes)
                .filter(([key]) => {
                  if (selectedType === "Ujian") return examTypes.includes(key);
                  if (selectedType === "Tugas")
                    return assignmentTypes.includes(key);
                  return true;
                })
                .map(([key, value]) => ({
                  label: key
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (c) => c.toUpperCase()),
                  value,
                }));

              return (
                <Select
                  {...field}
                  options={resultOption}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari Tipe..."
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={
                    resultOption.find((opt) => opt.value === field.value) ||
                    null
                  }
                />
              );
            }}
          />

          {errors.resultType?.message && (
            <p className="text-xs text-red-400">
              {errors.resultType.message.toString()}
            </p>
          )}
        </div>
      )}

      {(state.error || Object.keys(errors).length > 0) && (
        <span className="text-red-500">
          Terjadi Kesalahan! {state.message ?? ""}
          <pre>
            {Object.entries(errors)
              .map(([key, val]) => `${key}: ${val?.message}`)
              .join("\n")}
          </pre>
        </span>
      )}

      <div className="text-center pt-4 justify-items-center">
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full mr-2"></span>
          )}
          {isSubmitting ? "Memproses..." : "Update Nilai"}
        </button>
      </div>
    </form>
  );
};

export default UpdateManyResultsForm;
