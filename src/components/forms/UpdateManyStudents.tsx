"use client";

import { mstudentSchema, MstudentSchema } from "@/lib/formValidationSchema";
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
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { updateManyStudents } from "@/lib/actions"; // make sure this is defined

type UpdateManyStudentsFormProps = {
  ids?: string[];
  table: string;
  data?: any;
  relatedData?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const UpdateManyStudentsForm = ({
  ids,
  table,
  data,
  relatedData,
  setOpen,
}: UpdateManyStudentsFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MstudentSchema>({
    resolver: zodResolver(mstudentSchema),
    defaultValues: {
      ids,
      classId: "",
    },
  });
  console.log(data, "isi data");

  type Grade = { id: number; level: number };
  type ClassWithGrade = { grade?: Grade };

  const grades: Grade[] =
    (relatedData as ClassWithGrade[])
      ?.filter((c): c is { grade: Grade } => !!c.grade && !!c.grade.id)
      .map((c) => ({
        id: c.grade.id,
        level: c.grade.level,
      }))
      .filter(
        (grade, index, self) =>
          self.findIndex((g) => g.id === grade.id) === index
      ) || [];

  const classes = relatedData || [];
  console.log(classes, "isi Kelas Kelas");

  const initialState = { success: false, error: false, message: "" };
  const [state, formAction] = useActionState(updateManyStudents, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  useEffect(() => {
    if (state.success) {
      toast("Berhasil memperbarui siswa.");
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
        {ids.length} siswa akan diperbarui. Silakan pilih kelas baru:
      </span>
      <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-4 border rounded-xl shadow-inner bg-gray-50">
        {data
          .filter((student: { id: string }) => ids.includes(student.id))
          .map(
            (student: {
              id: string;
              name: string;
              class?: { name?: string };
              grade?: { level?: string };
              student_details?: { nisn?: string };
            }) => (
              <div
                key={student.id}
                className="border rounded-xl p-4 shadow-sm bg-white flex justify-between"
              >
                <div>
                  <h3 className="font-semibold text-lg">{student.name}</h3>
                  <p className="text-sm text-gray-500">
                    NISN: {student.student_details?.nisn ?? student.id}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>Nama Kelas: {student.class?.name ?? "-"}</p>
                  <p>Grade: {student.grade?.level ?? "-"}</p>
                </div>
              </div>
            )
          )}
      </div>
      <div className="flex flex-row gap-2 w-full justify-evenly mt-10">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Tingkat</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
          >
            <option value="">Pilih Tingkat</option>
            {grades.map((grade: { id: number; level: number }) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">{errors.gradeId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Kelas</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
          >
            <option value="">Pilih Kelas</option>
            {classes.map((kelas: any) => (
              <option value={kelas.id} key={kelas.id}>
                {kelas.name} - {kelas._count?.students ?? 0}/{kelas.capacity}{" "}
                Kapasitas
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
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
  );
};

export default UpdateManyStudentsForm;
