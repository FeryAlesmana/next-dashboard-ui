"use client";

import { mteacherSchema, MteacherSchema } from "@/lib/formValidationSchema";
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
import { updateManyTeachers } from "@/lib/actions"; // make sure this is defined
import Select from "react-select";
import { Day } from "@prisma/client";
import ConfirmDialog from "../ConfirmDialog";

type UpdateManyTeacherFormProps = {
  ids?: string[];
  table: string;
  data?: any;
  relatedData?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const UpdateManyTeacherForm = ({
  ids,
  table,
  data,
  relatedData,
  setOpen,
}: UpdateManyTeacherFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<MteacherSchema>({
    resolver: zodResolver(mteacherSchema),
    defaultValues: {
      ids,
      subjects: [],
      lessons: [],
    },
  });

  const { subjects = [], lessons = [] } = relatedData ?? {};
  console.log(subjects, "isi Mata pelajaran");
  const subjectOption = subjects.map(
    (subject: { id: number; name: string }) => ({
      value: subject.id,
      label: `${subject.name}`,
    })
  );

  const lessonOptions = lessons.map(
    (lesson: { id: number; name: string; day: Day }) => ({
      value: lesson.id,
      label: `${lesson.name} ${lesson.day}`,
    })
  );

  const initialState = { success: false, error: false, message: "" };
  const [state, formAction] = useActionState(updateManyTeachers, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const handleSubmitForm = handleSubmit((formData) => {
    setIsSubmitting(true);
    setShowConfirm(false);
    startTransition(() => {
      formAction(formData);
    });
  });
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true); // Show modal before submit
  };

  return (
    <>
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
                  <p className="text-sm text-gray-500">
                    {teacher.email || "-"}
                  </p>
                </div>
              </div>
            ))}
        </div>
        <div className="flex flex-row gap-2 w-full justify-evenly mt-10">
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-400">Mata Pelajaran</label>

            <Controller
              name="subjects"
              control={control}
              render={({ field }) => {
                const selectedValues = subjectOption.filter(
                  (opt: { value: number; label: string }) =>
                    field.value?.includes(opt.value)
                );
                return (
                  <Select
                    {...field}
                    isMulti
                    options={subjectOption}
                    className="text-sm"
                    classNamePrefix="select"
                    placeholder="Cari Matpel..."
                    value={selectedValues}
                    onChange={(selected) => {
                      field.onChange(selected.map((opt) => opt.value));
                    }}
                  />
                );
              }}
            />

            {errors.subjects?.message && (
              <p className="text-xs text-red-400">
                {errors.subjects.message.toString()}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-400">Jadwal</label>

            <Controller
              name="lessons"
              control={control}
              defaultValue={
                data?.lessons?.map(
                  (lesson: { id: number; name: string; day: Day }) => lesson.id
                ) || []
              }
              render={({ field }) => {
                const selectedValues = lessonOptions.filter(
                  (opt: { value: number; label: string }) =>
                    field.value?.includes(opt.value)
                );
                return (
                  <Select
                    {...field}
                    isMulti
                    options={lessonOptions}
                    className="text-sm"
                    classNamePrefix="select"
                    placeholder="Cari Jadwal..."
                    value={selectedValues}
                    onChange={(selectedOptions) => {
                      field.onChange(
                        selectedOptions.map((opt) => Number(opt.value))
                      );
                    }}
                  />
                );
              }}
            />

            {errors.lessons?.message && (
              <p className="text-xs text-red-400">
                {errors.lessons.message.toString()}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-700 text-white py-2 px-4 rounded-md border-none w-max self-center"
        >
          {isSubmitting ? "Mengirim..." : "Update Banyak"}
        </button>
      </form>
      {showConfirm && (
        <ConfirmDialog
          message="Ubah Banyak Guru?"
          onConfirm={handleSubmitForm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default UpdateManyTeacherForm;
