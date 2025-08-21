"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createClass, CurrentState, updateClass } from "@/lib/actions";
import { classSchema, ClassSchema } from "@/lib/formValidationSchema";
import ConfirmDialog from "../ConfirmDialog";
import Select from "react-select";
import { BaseFormProps } from "./AssignmentForm";

const ClassForm = ({
  setOpen,
  type,
  data,
  relatedData,
  onChanged,
}: BaseFormProps) => {
  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
  });

  const createClassHandler = async (
    prevState: CurrentState,
    payload: ClassSchema
  ): Promise<CurrentState> => {
    return await createClass(prevState, payload);
  };

  const updateClassHandler = async (
    prevState: CurrentState,
    payload: ClassSchema
  ): Promise<CurrentState> => {
    return await updateClass(prevState, payload);
  };

  const [state, formAction] = useActionState(
    type === "create" ? createClassHandler : updateClassHandler,
    {
      success: false,
      error: false,
      message: "",
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<ClassSchema | null>(null);

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  const handleSubmitForm = () => {
    if (!formData) return;
    setIsSubmitting(true);
    startTransition(() => {
      formAction(formData);
    });
    setShowConfirm(false);
  };

  // Ubah onSubmit agar cek validasi dulu sebelum set showConfirm
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await trigger();
    if (valid) {
      handleSubmit((data) => {
        setFormData(data);
        setShowConfirm(true);
      })();
    } else {
      setShowConfirm(false);
    }
  };

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const updatedItem = state.data ?? formData;
      toast(
        `Kelas telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      if (onChanged && updatedItem) {
        onChanged(updatedItem); // 🔥 notify parent so it can update localData
      } else {
        router.refresh(); // fallback if no handler passed
      }
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router, onChanged, formData]);

  const { teachers = [], grades = [] } = relatedData ?? {};

  const teacherOptions = teachers.map((teacher: any) => ({
    value: teacher.id,
    label: `${teacher.name} - ${teacher.namalengkap}`,
  }));

  return (
    <>
      {showConfirm && (
        <ConfirmDialog
          message={type === "create" ? "Tambah Kelas baru?" : "Ubah Kelas?"}
          onConfirm={handleSubmitForm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Tambah Kelas baru" : "Edit Kelas"}
        </h1>
        <span className="text-xs text-gray-400 font-medium">
          Informasi Kelas
        </span>
        <div className="flex justify-between flex-wrap gap-4 m-4 mb-8">
          <InputField
            label="Kelas"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
          />
          <InputField
            label="Kapasitas"
            name="capacity"
            type="number"
            defaultValue={data?.capacity}
            register={register}
            error={errors?.capacity}
          />
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-400">Wali Kelas</label>

            <Controller
              name="supervisorId"
              control={control}
              defaultValue={data?.supervisorId || ""}
              render={({ field }) => {
                return (
                  <Select
                    {...field}
                    options={teacherOptions}
                    className="text-sm"
                    classNamePrefix="select"
                    placeholder="Cari Wali Kelas..."
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

            {errors.supervisorId?.message && (
              <p className="text-xs text-red-400">
                {errors.supervisorId.message.toString()}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-400">Angkatan</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("gradeId")}
              defaultValue={data?.gradeId ?? ""}
            >
              {grades.map((grade: { id: number; level: number }) => (
                <option value={grade.id} key={grade.id}>
                  {grade.level}
                </option>
              ))}
            </select>
            {errors.gradeId?.message && (
              <p className="text-xs text-red-400">
                {errors.gradeId.message.toString()}
              </p>
            )}
          </div>
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
              ? "Tambah kelas"
              : "Update dan Simpan"}
          </button>
        </div>
      </form>
    </>
  );
};

export default ClassForm;
