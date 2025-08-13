"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { examSchema, ExamSchema } from "@/lib/formValidationSchema";
import { createExam, CurrentState, updateExam } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Select from "react-select";

const ExamForm = ({
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
    formState: { errors },
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
  });
  const createExamHandler = async (
    prevState: CurrentState,
    payload: ExamSchema
  ): Promise<CurrentState> => {
    return await createExam(prevState, payload);
  };

  const updateExamHandler = async (
    prevState: CurrentState,
    payload: ExamSchema
  ): Promise<CurrentState> => {
    return await updateExam(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    type === "create" ? createExamHandler : updateExamHandler,
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

  useEffect(() => {
    if (state.success) {
      toast(
        `Ujian telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { lessons } = relatedData;
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);

    // Convert to Asia/Jakarta time
    const jakartaDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    const year = jakartaDate.getFullYear();
    const month = String(jakartaDate.getMonth() + 1).padStart(2, "0");
    const day = String(jakartaDate.getDate()).padStart(2, "0");
    const hours = String(jakartaDate.getHours()).padStart(2, "0");
    const minutes = String(jakartaDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const lessonOption = lessons.map(
    (lesson: {
      id: number;
      name: string;
      subject: { name: string };
      class: { name: string };
    }) => ({
      value: lesson.id,
      label: `${lesson.name} - ${lesson.subject?.name ?? "-"} - ${
        lesson.class?.name ?? "-"
      }`,
    })
  );

  return (
    <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tambah Ujian baru" : "Edit Guru"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">Informasi Ujian</span>
      <div className="flex justify-between flex-wrap gap-10 m-4 mb-8">
        <InputField
          label="Nama Ujian"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        ></InputField>
        <InputField
          label="Waktu mulai"
          name="startTime"
          defaultValue={
            data?.startTime ? formatDateForInput(data.startTime) : ""
          }
          register={register}
          error={errors?.startTime}
          type="datetime-local"
        ></InputField>
        <InputField
          label="Waktu selesai"
          name="endTime"
          defaultValue={data?.endTime ? formatDateForInput(data.endTime) : ""}
          register={register}
          error={errors?.endTime}
          type="datetime-local"
        ></InputField>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Jadwal</label>

          <Controller
            name="lessonId"
            control={control}
            defaultValue={data?.lessonId || ""}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  options={lessonOption}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari Jadwal..."
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={
                    lessonOption.find(
                      (opt: { value: number; label: string }) =>
                        opt.value === field.value
                    ) || null
                  }
                />
              );
            }}
          />

          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Tipe Ujian</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("exTypes")}
            defaultValue={data?.exTypes}
          >
            <option value="">Pilih Tipe Ujian</option>
            <option value="UJIAN_HARIAN">Ujian Harian</option>
            <option value="UJIAN_TENGAH_SEMESTER">Ujian Tengah Semester</option>
            <option value="UJIAN_AKHIR_SEMESTER">Ujian Akhir Semester</option>
          </select>
          {errors.exTypes?.message && (
            <p className="text-xs text-red-400">
              {errors.exTypes.message.toString()}
            </p>
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
      </div>

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
            ? "Tambah ujian"
            : "Update dan Simpan"}
        </button>
      </div>
    </form>
  );
};

export default ExamForm;
