"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchema";
import { createSubject, CurrentState, updateSubject } from "@/lib/actions";
import { startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { BaseFormProps } from "./AssignmentForm";

const SubjectForm = ({
  setOpen,
  type,
  data,
  relatedData,
  onChanged,
}: BaseFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
  });
  const createSubjectHandler = async (
    prevState: CurrentState,
    payload: SubjectSchema
  ): Promise<CurrentState> => {
    return await createSubject(prevState, payload);
  };

  const updateSubjectHandler = async (
    prevState: CurrentState,
    payload: SubjectSchema
  ): Promise<CurrentState> => {
    return await updateSubject(prevState, payload);
  };
  const [state, formAction] = useActionState(
    type === "create" ? createSubjectHandler : updateSubjectHandler,
    {
      success: false,
      error: false,
      message: "",
    }
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
      const updatedItem = state.data ?? data;
      toast(
        `Mata Pelajaran telah berhasil di ${
          type === "create" ? "Tambah!" : "Edit!"
        }`
      );
      setOpen(false);
      if (onChanged && updatedItem) {
        onChanged(updatedItem); // 🔥 notify parent so it can update localData
      } else {
        router.refresh(); // fallback if no handler passed
      }
      router.refresh();
    }
  }, [state, type, setOpen, router, onChanged, data]);

  const { teachers = [] } = relatedData ?? {};
  const teacherOption = teachers.map(
    (teacher: { id: string; name: string; namalengkap: string }) => ({
      value: teacher.id,
      label: `${teacher.name} ${teacher.namalengkap}`,
    })
  );

  return (
    <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Tambah Mata Pelajaran Baru"
          : "Edit Mata Pelajaran"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Nama Mata Pelajaran"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        ></InputField>
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Guru</label>

          <Controller
            name="teachers"
            control={control}
            defaultValue={
              data?.teachers?.map((teacher: { id: string }) => teacher.id) || []
            }
            render={({ field }) => {
              const selectedValues = teacherOption.filter(
                (opt: { value: string; label: string }) =>
                  field.value?.includes(opt.value)
              );

              return (
                <Select
                  {...field}
                  isMulti
                  options={teacherOption}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari guru..."
                  value={selectedValues}
                  onChange={(selectedOptions) => {
                    field.onChange(selectedOptions.map((opt) => opt.value));
                  }}
                />
              );
            }}
          />

          {errors.teachers?.message && (
            <p className="text-xs text-red-400">
              {errors.teachers.message.toString()}
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
            ? "Tambah Mata Pelajaran"
            : "Update dan Simpan"}
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;
