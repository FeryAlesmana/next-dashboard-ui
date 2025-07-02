"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { examSchema, ExamSchema } from "@/lib/formValidationSchema";
import { createExam, CurrentState, updateExam } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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

  const onSubmit = handleSubmit((data) => {
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
    return date.toISOString().slice(0, 16); // returns "YYYY-MM-DDTHH:MM"
  };

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
          <label className="text-xs text-gray-400">Pelajaran</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={data?.lessonId}
          >
            {lessons.map((lesson: { id: number; name: string }) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
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

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ExamForm;
