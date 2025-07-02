"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchema";
import { createSubject, CurrentState, updateSubject } from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Select from "react-select";

const SubjectForm = ({
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

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    startTransition(() => {
      formAction(data);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Mata Pelajaran telah berhasil di ${
          type === "create" ? "Tambah!" : "Edit!"
        }`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { teachers = [] } = relatedData ?? {};
  const teacherOption = teachers.map(
    (teacher: { id: string; name: string; surname: string }) => ({
      value: teacher.id,
      label: `${teacher.name} ${teacher.surname}`,
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
          <label className="text-xs text-gray-400">Siswa</label>

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
                  placeholder="Cari siswa..."
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

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default SubjectForm;
