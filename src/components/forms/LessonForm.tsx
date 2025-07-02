"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchema";
import { createLesson, CurrentState, updateLesson } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Select from "react-select";

const LessonForm = ({
  setOpen,
  type,
  data,
  relatedData,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
  relatedData: any;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
  });
  const createLessonHandler = async (
    prevState: CurrentState,
    payload: LessonSchema
  ): Promise<CurrentState> => {
    return await createLesson(prevState, payload);
  };

  const updateLessonHandler = async (
    prevState: CurrentState,
    payload: LessonSchema
  ): Promise<CurrentState> => {
    return await updateLesson(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    type === "create" ? createLessonHandler : updateLessonHandler,
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
        `Jadwal telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { subjects = [], classes = [], teachers = [] } = relatedData ?? {};
  const SubjectOptions = subjects.map(
    (subject: { id: number; name: string }) => ({
      value: subject.id,
      label: `${subject.name}`,
    })
  );
  const ClassOptions = classes.map((kelas: { id: number; name: string }) => ({
    value: kelas.id,
    label: `${kelas.name}`,
  }));
  const teacherOptions = teachers.map(
    (teacher: { id: string; name: string; surname: string }) => ({
      value: teacher.id,
      label: `${teacher.name} ${teacher.surname}`,
    })
  );
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // returns "YYYY-MM-DDTHH:MM"
  };
  return (
    <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Tambah Pelajaran Baru</h1>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Pelajaran
      </span>

      <div className="flex justify-between flex-wrap gap-4 m-4">
        <InputField
          label="Nama"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        ></InputField>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Mata Pelajaran</label>

          <Controller
            name="subjectId"
            control={control}
            defaultValue={data?.subjectId || ""}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  options={SubjectOptions}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari Matpel..."
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={
                    SubjectOptions.find(
                      (opt: { value: number; label: string }) =>
                        opt.value === field.value
                    ) || null
                  }
                />
              );
            }}
          />

          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>
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
          <label className="text-xs text-gray-400">Kelas</label>

          <Controller
            name="classId"
            control={control}
            defaultValue={data?.classId || ""}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  options={ClassOptions}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari Kelas..."
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={
                    ClassOptions.find(
                      (opt: { value: number; label: string }) =>
                        opt.value === field.value
                    ) || null
                  }
                />
              );
            }}
          />

          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Hari jadwal</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("day")}
            defaultValue={data?.day}
          >
            <option value="SENIN">SENIN</option>
            <option value="SELASA">SELASA</option>
            <option value="RABU">RABU</option>
            <option value="KAMIS">KAMIS</option>
            <option value="JUMAT">JUMAT</option>
          </select>
          {errors.day?.message && (
            <p className="text-xs text-red-400">
              {errors.day.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Guru</label>

          <Controller
            name="teacherId"
            control={control}
            defaultValue={data?.teacherId || ""}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  options={teacherOptions}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari Guru..."
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={
                    teacherOptions.find(
                      (opt: { value: string; label: string }) =>
                        opt.value === field.value
                    ) || null
                  }
                />
              );
            }}
          />

          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">
              {errors.teacherId.message.toString()}
            </p>
          )}
        </div>
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

export default LessonForm;
