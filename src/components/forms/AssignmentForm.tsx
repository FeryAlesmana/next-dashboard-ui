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
import { AssignmentSchema, assignmentSchema } from "@/lib/formValidationSchema";
import {
  createAssignment,
  CurrentState,
  updateAssignment,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Select from "react-select";
import ConfirmDialog from "../ConfirmDialog";

export type BaseFormProps = {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
  relatedData?: any;
  onChanged?: (item: any) => void;
};

const AssignmentForm = ({
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
    trigger,
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
  });

  const createAssignmentHandler = async (
    prevState: CurrentState,
    payload: AssignmentSchema
  ): Promise<CurrentState> => {
    return await createAssignment(prevState, payload);
  };

  const updateAssignmentHandler = async (
    prevState: CurrentState,
    payload: AssignmentSchema
  ): Promise<CurrentState> => {
    return await updateAssignment(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    type === "create" ? createAssignmentHandler : updateAssignmentHandler,
    initialState
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<AssignmentSchema | null>(null);

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  const handleConfirmSubmit = () => {
    if (formData) {
      setIsSubmitting(true);
      startTransition(() => {
        formAction(formData);
      });
    }
    setShowConfirm(false);
  };

  // Saat tombol submit diklik:
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await trigger();
    if (valid) {
      // Ambil data form jika valid dan tampilkan dialog konfirmasi
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
      const updatedItem = state.data ?? formData; // <- depends on what your action returns

      toast(
        `Tugas telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      setOpen(false);

      if (onChanged && updatedItem) {
        onChanged(updatedItem); // 🔥 notify parent so it can update localData
      } else {
        router.refresh(); // fallback if no handler passed
      }
    }
  }, [state, type, setOpen, router, onChanged, formData]);

  const { lessons = [] } = relatedData ?? {};

  const lessonOption = lessons.map(
    (lesson: {
      id: number;
      name: string;
      subject: { name: string };
      class: { name: string };
    }) => ({
      value: lesson.id,
      label: `${lesson.name} - ${lesson.subject?.name ?? " "} - ${
        lesson.class?.name ?? " "
      }`,
    })
  );

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
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

  return (
    <>
      <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Tambah Tugas Baru" : "Edit Tugas"}
        </h1>
        <span className="text-xs text-gray-400 font-medium">
          Informasi Autentikasi
        </span>
        <div className="flex justify-between flex-wrap gap-4 m-4">
          <InputField
            label="Judul"
            name="title"
            defaultValue={data?.title}
            register={register}
            error={errors?.title}
          />
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-400">Tipe Tugas</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("assType")}
              defaultValue={data?.assType}
            >
              <option value="">Pilih Tipe Tugas</option>
              <option value="TUGAS_HARIAN">Tugas Harian</option>
              <option value="PEKERJAAN_RUMAH">Pekerjaan Rumah(PR)</option>
              <option value="TUGAS_AKHIR">Tugas Akhir</option>
            </select>
            {errors.assType?.message && (
              <p className="text-xs text-red-400">
                {errors.assType.message.toString()}
              </p>
            )}
          </div>
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
          <InputField
            label="Deadline"
            name="dueDate"
            type="datetime-local"
            defaultValue={data?.dueDate ? formatDateForInput(data.dueDate) : ""}
            register={register}
            error={errors?.dueDate}
          />
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
              ? "Tambah tugas"
              : "Update dan Simpan"}
          </button>
        </div>
      </form>
      {showConfirm && (
        <ConfirmDialog
          message={type === "create" ? "Tambah tugas baru?" : "Ubah tugas?"}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default AssignmentForm;
