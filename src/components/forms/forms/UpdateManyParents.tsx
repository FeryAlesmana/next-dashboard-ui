"use client";

import {
  mparentSchema,
  MparentSchema,
  mteacherSchema,
  MteacherSchema,
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
import { updateManyParents, updateManyTeachers } from "@/lib/actions"; // make sure this is defined
import Select from "react-select";
import { Day } from "@prisma/client";
import InputField from "../InputField";

type UpdateManyParentFormProps = {
  ids?: string[];
  table: string;
  data?: any;
  relatedData?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const UpdateManyParentForm = ({
  ids,
  table,
  data,
  relatedData,
  setOpen,
}: UpdateManyParentFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<MparentSchema>({
    resolver: zodResolver(mparentSchema),
    defaultValues: {
      ids,
      students: [],
    },
  });

  const { students = [] } = relatedData ?? {};
  console.log(students, "isi Mata pelajaran");
  const studentOptions = students.map(
    (student: { id: string; name: string; namalengkap: string }) => ({
      value: student.id,
      label: `${student.name} ${student.namalengkap}`,
    })
  );
  const initialState = { success: false, error: false, message: "" };
  const [state, formAction] = useActionState(updateManyParents, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  useEffect(() => {
    if (state.success) {
      toast("Berhasil memperbarui Guru-guru.");
      setOpen(false);
      router.refresh();
    }
  }, [state.success, setOpen, router]);

  if (!ids || ids.length === 0) {
    return <span>Tidak ada data yang dipilih.</span>;
  }

  const onSubmit = handleSubmit((formData) => {
    setIsSubmitting(true);
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <form onSubmit={onSubmit} className="p-4 flex flex-col gap-4">
      <input type="hidden" name="table" value={table} />
      {ids.map((id) => (
        <input key={id} type="hidden" value={id} {...register("ids")} />
      ))}

      <span className="text-center font-medium">
        {ids.length} Guru akan diperbarui. <br />
        Silakan pilih Mata Pelajaran dan Jadwal baru:
      </span>
      <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-4 border rounded-xl shadow-inner bg-gray-50">
        {data
          .filter((teacher: { id: string }) => ids.includes(teacher.id))
          .map((teacher: { id: string; name: string; email: string }) => (
            <div
              key={teacher.id}
              className="border rounded-xl p-4 shadow-sm bg-white flex justify-between"
            >
              <div>
                <h3 className="font-semibold text-lg">{teacher.name}</h3>
                <p className="text-sm text-gray-500">{teacher.email || "-"}</p>
              </div>
            </div>
          ))}
      </div>
      <div className="flex flex-row gap-2 w-full justify-evenly mt-10">
        <InputField
          label="Alamat"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors?.address}
        ></InputField>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Siswa</label>

          <Controller
            name="students"
            control={control}
            defaultValue={
              data?.students?.map((student: { id: string }) => student.id) || []
            }
            render={({ field }) => {
              const selectedValues = studentOptions.filter(
                (opt: { value: string; label: string }) =>
                  field.value?.includes(opt.value)
              );

              return (
                <Select
                  {...field}
                  isMulti
                  options={studentOptions}
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

          {errors.students?.message && (
            <p className="text-xs text-red-400">
              {errors.students.message.toString()}
            </p>
          )}
        </div>
      </div>
      <div className="text-center pt-4 justify-items-center">
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full mr-2"></span>
          )}
          {isSubmitting ? "Memproses..." : "Update Wali Murid"}
        </button>
      </div>
    </form>
  );
};

export default UpdateManyParentForm;
