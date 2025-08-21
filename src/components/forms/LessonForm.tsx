"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchema";
import { createLesson, CurrentState, updateLesson } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Select from "react-select";
import ConfirmDialog from "../ConfirmDialog";
import { BaseFormProps } from "./AssignmentForm";

const LessonForm = ({
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
    trigger,
    formState: { errors },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
  });

  const createLessonHandler: (
    prevState: CurrentState,
    payload: LessonSchema
  ) => Promise<CurrentState> = async (prevState, payload) => {
    return await createLesson(prevState, payload);
  };

  const updateLessonHandler: (
    prevState: CurrentState,
    payload: LessonSchema
  ) => Promise<CurrentState> = async (prevState, payload) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<LessonSchema | null>(null);

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const updatedItem = state.data ?? formData;
      toast(
        `Jadwal telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      setOpen(false);
      if (onChanged && updatedItem) {
        onChanged(updatedItem); // 🔥 notify parent so it can update localData
      } else {
        router.refresh(); // fallback if no handler passed
      }
      router.refresh();
    }
  }, [state, type, setOpen, router, onChanged, formData]);

  // Submit sebenarnya, dipanggil setelah konfirmasi "Ya"
  const submitForm = () => {
    if (!formData) return;
    setIsSubmitting(true);

    const dayMap: Record<LessonSchema["day"], number> = {
      SENIN: 1,
      SELASA: 2,
      RABU: 3,
      KAMIS: 4,
      JUMAT: 5,
    };
    const targetDayIndex = dayMap[formData.day]; // 1–5 (Senin–Jumat)
    const today = new Date();
    const currentWeekMonday = new Date(today);
    const dayOfWeek = today.getDay();

    currentWeekMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    currentWeekMonday.setHours(0, 0, 0, 0);

    const targetDate = new Date(currentWeekMonday);
    targetDate.setDate(currentWeekMonday.getDate() + (targetDayIndex - 1));

    const toDateTime = (timeStr: string): Date => {
      const [hour, minute] = timeStr.split(":").map(Number);
      const result = new Date(targetDate);
      result.setHours(hour, minute, 0, 0);
      return result;
    };

    const payload = {
      ...formData,
      startTime: toDateTime(formData.startTime).toISOString(),
      endTime: toDateTime(formData.endTime).toISOString(),
    };

    startTransition(() => {
      formAction(payload);
    });
    setShowConfirm(false);
  };

  // Fungsi tombol submit di form: validasi dulu,
  // jika valid, simpan data dan tampilkan konfirmasi,
  // jika tidak valid, jangan tampilkan konfirmasi.
  const onSubmit = async () => {
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
    (teacher: { id: string; name: string; namalengkap: string }) => ({
      value: teacher.id,
      label: `${teacher.name} ${teacher.namalengkap}`,
    })
  );

  return (
    <>
      <form
        action=""
        className="flex flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Tambah Jadwal Baru" : "Edit Jadwal"}
        </h1>
        <span className="text-xs text-gray-400 font-medium">
          Informasi Jadwal
        </span>

        <div className="flex justify-between flex-wrap gap-4 m-4">
          <InputField
            label="Nama"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
          />
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-400">Mata Pelajaran</label>

            <Controller
              name="subjectId"
              control={control}
              defaultValue={data?.subjectId || ""}
              render={({ field }) => (
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
              )}
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
              data?.startTime
                ? new Date(data.startTime).toTimeString().slice(0, 5)
                : ""
            }
            register={register}
            error={errors?.startTime}
            type="time"
          />

          <InputField
            label="Waktu selesai"
            name="endTime"
            defaultValue={
              data?.endTime
                ? new Date(data.endTime).toTimeString().slice(0, 5)
                : ""
            }
            register={register}
            error={errors?.endTime}
            type="time"
          />
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-400">Kelas</label>

            <Controller
              name="classId"
              control={control}
              defaultValue={data?.classId || ""}
              render={({ field }) => (
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
              )}
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
              render={({ field }) => (
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
              )}
            />

            {errors.teacherId?.message && (
              <p className="text-xs text-red-400">
                {errors.teacherId.message.toString()}
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
            disabled={isSubmitting}
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full mr-2"></span>
            )}
            {isSubmitting
              ? "Memproses..."
              : type === "create"
              ? "Tambahkan Jadwal"
              : "Update dan Simpan"}
          </button>
        </div>
      </form>

      {showConfirm && (
        <ConfirmDialog
          message={
            type === "create"
              ? "Tambahkan Jadwal baru?"
              : "Simpan perubahan jadwal?"
          }
          onConfirm={submitForm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default LessonForm;
