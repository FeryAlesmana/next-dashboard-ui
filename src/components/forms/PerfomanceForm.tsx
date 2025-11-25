"use client";

import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  startTransition,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  performanceSchema,
  PerformanceSchema,
} from "@/lib/formValidationSchema";
import { createPerformance, updatePerformance } from "@/lib/actions";
import InputField from "../InputField";
import Select from "react-select";

export default function PerformanceForm({
  setOpen,
  type,
  data,
  staffId,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type:
    | "create"
    | "update"
    | "delete"
    | "deleteMany"
    | "updateMany"
    | "createMany"
    | "activateAccount"
    | "readMany";
  data?: any; // performanceLog data
  staffId: string;
}) {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    setValue,
  } = useForm<PerformanceSchema>({
    resolver: zodResolver(performanceSchema),
    defaultValues: {
      staffId: staffId,
      month: data?.month,
      score: data?.score,
      note: data?.note || "",
    },
  });

  // Action handlers
  const createHandler = async (prev: any, payload: PerformanceSchema) =>
    await createPerformance(prev, payload);

  const updateHandler = async (prev: any, payload: PerformanceSchema) =>
    await updatePerformance(prev, payload);

  const [state, formAction] = useActionState(
    type === "create" ? createHandler : updateHandler,
    { success: false, error: false, message: "" }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<PerformanceSchema | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  useEffect(() => {
    if (state.success) {
      toast(
        `Performance telah berhasil di ${
          type === "create" ? "Tambah!" : "Edit!"
        }`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, setOpen, router, type]);

  const submitForm = () => {
    if (!formData) return;

    setIsSubmitting(true);
    startTransition(() => {
      formAction(formData);
    });
    setShowConfirm(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valid = await trigger();
    if (valid) {
      handleSubmit((d) => {
        setFormData(d);
        setShowConfirm(true);
      })();
    } else {
      setShowConfirm(false);
    }
  };
  console.log(data, "data in perfomance");

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-3">
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Tambah Data baru" : "Edit Data"}
        </h1>
        <div>
          <label className="text-xs text-gray-500">Staff ID</label>
          <input
            {...register("staffId")}
            className="p-2 border rounded w-full"
            disabled={true}
          />
          {errors.staffId && (
            <p className="text-red-500 text-xs">{errors.staffId.message}</p>
          )}
        </div>

        {/* Month */}
        {/* Month */}
        <div>
          <label className="text-xs text-gray-500">Bulan</label>

          <Select
            options={[
              { value: "01", label: "Januari" },
              { value: "02", label: "Februari" },
              { value: "03", label: "Maret" },
              { value: "04", label: "April" },
              { value: "05", label: "Mei" },
              { value: "06", label: "Juni" },
              { value: "07", label: "Juli" },
              { value: "08", label: "Agustus" },
              { value: "09", label: "September" },
              { value: "10", label: "Oktober" },
              { value: "11", label: "November" },
              { value: "12", label: "Desember" },
            ]}
            isDisabled={type === "update"}
            defaultValue={
              type === "update"
                ? {
                    value: data.month.split("-")[1],
                    label: new Date(`${data.month}-01`).toLocaleString(
                      "id-ID",
                      {
                        month: "long",
                      }
                    ),
                  }
                : null
            }
            onChange={(selected) => {
              const year = new Date().getFullYear(); // or choose dynamically
              const monthValue = `${year}-${selected?.value}`;
              setValue("month", monthValue, { shouldValidate: true });
            }}
            className="text-sm"
          />

          {errors.month && (
            <p className="text-red-500 text-xs">{errors.month.message}</p>
          )}
        </div>

        {/* Score */}
        <div>
          <label className="text-xs text-gray-500">Skor</label>
          <input
            type="number"
            {...register("score")}
            className="p-2 border rounded w-full"
            placeholder="0 - 100"
          />
          {errors.score && (
            <p className="text-red-500 text-xs">{errors.score.message}</p>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="text-xs text-gray-500">Catatan (optional)</label>
          <textarea
            {...register("note")}
            className="p-2 border rounded w-full"
          />
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
              ? "Tambah Perfoma"
              : "Update dan Simpan"}
          </button>
        </div>
      </form>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-5 rounded-xl">
            <p className="mb-4">
              Yakin ingin {type === "create" ? "menambah" : "mengupdate"} data?
            </p>

            <div className="flex gap-3">
              <button
                className="bg-gray-200 px-4 py-2 rounded"
                onClick={() => setShowConfirm(false)}
              >
                Batal
              </button>

              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded"
                onClick={submitForm}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
