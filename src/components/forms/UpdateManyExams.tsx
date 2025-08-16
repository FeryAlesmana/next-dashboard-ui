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
import { mexamSchema, MexamSchema } from "@/lib/formValidationSchema";
import { CurrentState, updateAssignments, updateExams } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Select from "react-select";
import ConfirmDialog from "../ConfirmDialog";
import { UpdateManyFormProps } from "./UpdateManyAssignments";

const UpdateManyExamsForm = ({
  ids,
  table,
  data,
  relatedData,
  setOpen,
  onChanged,
}: UpdateManyFormProps) => {
  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<MexamSchema>({
    resolver: zodResolver(mexamSchema),
  });

  const updateAssignmentHandler = async (
    prevState: CurrentState,
    payload: MexamSchema
  ): Promise<CurrentState> => {
    return await updateExams(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    updateAssignmentHandler,
    initialState
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  const handleSubmitForm = handleSubmit((data) => {
    setIsSubmitting(true);
    startTransition(() => {
      formAction(data);
    });
  });
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await trigger();
    if (valid) {
      // Jika valid, tampilkan dialog konfirmasi
      setShowConfirm(true);
    } else {
      // Jika tidak valid, jangan tampilkan dialog dan jangan submit
      setShowConfirm(false);
    }
  };
  const router = useRouter();

  useEffect(() => {
    setValue("ids", ids!);
    if (state.success) {
      toast(`Tugas telah berhasil di Edit!`);
      if (state.data && onChanged) {
        onChanged(state.data);
      }
      setOpen(false);
      router.refresh();
    }
  }, [state, setOpen, router, setValue, ids, onChanged]);

  const { lessons } = relatedData;

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);

    // Convert to Asia/Jakarta time
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
  if (!ids || ids.length === 0) {
    return <span>Tidak ada data yang dipilih.</span>;
  }
  return (
    <>
      <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">Edit Tugas Banyak</h1>
        <input type="hidden" name="table" value={table} />
        {/* {ids.map((id: number) => (
          <input key={id} type="hidden" value={id} {...register("ids")} />
        ))} */}
        <input type="hidden" {...register("ids")} />
        <span className="text-center font-medium">
          {ids.length} Nilai akan diperbarui.
        </span>
        <span className="text-xs text-gray-400 font-medium">
          Informasi Ujian
        </span>
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
            <label className="text-xs text-gray-400">Tipe Ujian</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("exType")}
              defaultValue={data?.exType}
            >
              <option value="">Pilih Tipe Ujian</option>
              <option value="UJIAN_HARIAN">Ujian Harian</option>
              <option value="UJIAN_TENGAH_SEMESTER">
                Ujian Tengah Semester
              </option>
              <option value="UJIAN_AKHIR_SEMESTER">Ujian Akhir Semester</option>
            </select>
            {errors.exType?.message && (
              <p className="text-xs text-red-400">
                {errors.exType.message.toString()}
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
            {isSubmitting ? "Memproses..." : "Update dan Simpan"}
          </button>
        </div>
      </form>
      {showConfirm && (
        <ConfirmDialog
          message="Edit Tugas ini akan mengubah data yang ada. Apakah Anda yakin?"
          onConfirm={handleSubmitForm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default UpdateManyExamsForm;
