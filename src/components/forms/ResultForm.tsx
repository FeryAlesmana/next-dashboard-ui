"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchema";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import Select from "react-select";
import { createResult, CurrentState, updateResult } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ResultForm = ({
  setOpen,
  type,
  data,
  relatedData,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
  });
  const createResultHandler = async (
    prevState: CurrentState,
    payload: ResultSchema
  ): Promise<CurrentState> => {
    return await createResult(prevState, payload);
  };

  const updateResultHandler = async (
    prevState: CurrentState,
    payload: ResultSchema
  ): Promise<CurrentState> => {
    return await updateResult(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    type === "create" ? createResultHandler : updateResultHandler,
    initialState
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  const onSubmit = handleSubmit((data) => {
    setIsSubmitting(true);
    startTransition(() => {
      formAction(data);
    });
  });

  const router = useRouter();

  const [selectedType, setSelectedType] = useState<"Ujian" | "Tugas" | "">(
    data?.examId ? "Ujian" : data?.assignmentId ? "Tugas" : ""
  );
  useEffect(() => {
    setValue("selectedType", selectedType);
    if (state.success) {
      toast(
        `Ujian telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router, setValue, selectedType]);

  const { students = [], exams = [], assignments = [] } = relatedData ?? {};
  const studentOption = students.map(
    (student: { id: string; name: string; surname: string }) => ({
      value: student.id,
      label: `${student.name} ${student.surname}`,
    })
  );
  const ExamOption = exams.map((exam: { id: number; title: string }) => ({
    value: exam.id,
    label: `${exam.title}`,
  }));
  const AssignmentOption = assignments.map(
    (assignment: { id: number; title: string }) => ({
      value: assignment.id,
      label: `${assignment.title}`,
    })
  );
  console.log(JSON.stringify(data) + "<= sended data");

  return (
    <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Tambah Nilai Baru</h1>
      <span className="text-xs text-gray-400 font-medium">Informasi Nilai</span>
      <div className="flex justify-between flex-wrap gap-10 m-4 mb-8">
        <InputField
          label="Nilai"
          name="score"
          type="number"
          defaultValue={data?.score}
          register={register}
          error={errors?.score}
        />

        {/* Student select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Siswa</label>

          <Controller
            name="studentId"
            control={control}
            defaultValue={data?.studentId || ""}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  options={studentOption}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari Siswa..."
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={
                    studentOption.find(
                      (opt: { value: string; label: string }) =>
                        opt.value === field.value
                    ) || null
                  }
                />
              );
            }}
          />

          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>

        {/* Type selector */}
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

        {/* Conditional dropdown */}
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
                    options={ExamOption}
                    className="text-sm"
                    classNamePrefix="select"
                    placeholder="Cari Ujian..."
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value)
                    }
                    value={
                      ExamOption.find(
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
                    options={AssignmentOption}
                    className="text-sm"
                    classNamePrefix="select"
                    placeholder="Cari Tugas..."
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value)
                    }
                    value={
                      AssignmentOption.find(
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
      </div>
      {data && (
        <InputField
          label="Id"
          name="id"
          defaultValue={data?.id}
          register={register}
          error={errors?.id}
          hidden
        />
      )}
      {data && (
        <InputField
          label="selectedType"
          name="selectedType"
          defaultValue={selectedType}
          register={register}
          // error={errors?.id}
          hidden
        />
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
          {isSubmitting
            ? "Memproses..."
            : type === "create"
            ? "Tambah Nilai"
            : "Update dan Simpan"}
        </button>
      </div>


    </form>
  );
};

export default ResultForm;
