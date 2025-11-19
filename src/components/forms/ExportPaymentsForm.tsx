"use client";

import { exportPaymentsToExcel } from "@/lib/actions";
import {
  exportPaymentsSchema,
  ExportPaymentsSchema,
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
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function ExportPaymentsForm({
  setOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<ExportPaymentsSchema>({
    resolver: zodResolver(exportPaymentsSchema),
  });
  const initialState = {
    fileName: null,
    filePath: null,
    error: null,
  };
  const period = watch("period"); // <- detect selected option
  const exportHandler = async (prev: any, data: ExportPaymentsSchema) => {
    return await exportPaymentsToExcel(prev, data);
  };

  const [state, formAction] = useActionState(exportHandler, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
      setIsSubmitting(false);
    }
  }, [state.error]);
  useEffect(() => {
    if (state.success) {
      toast("✅ Export Pembayaran berhasil");

      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast(`❌ Export gagal: ${state.message}`);
    }
  }, [state, setOpen, router]);
  const handleSubmitForm = handleSubmit((data) => {
    setIsSubmitting(true);
    startTransition(() => {
      formAction(data);
    });
  });
  useEffect(() => {
    if (!state?.downloadUrl) return;
    console.log("Downloading from:", state.downloadUrl);
    const a = document.createElement("a");
    a.href = state.downloadUrl;
    a.download = state.fileName || "export.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [state]);

  return (
    <form
      onSubmit={handleSubmitForm}
      className="p-4 border rounded-md space-y-4 text-sm"
    >
      <div className="text-xl font-semibold">Export Pembayaran</div>
      <div>
        <label className="block text-gray-600 font-medium">Periode</label>
        <select
          className="w-full border rounded p-2"
          defaultValue="month"
          {...register("period")}
        >
          <option value="week">Minggu Ini</option>
          <option value="month">Bulan Ini</option>
          <option value="year">Tahun Ini</option>
          <option value="range">Rentang Kustom</option>
        </select>
      </div>
      {errors.period?.message && (
        <p className="text-xs text-red-400">
          {errors.period.message.toString()}
        </p>
      )}

      {/* RANGE FIELDS */}
      {period === "range" && (
        <div id="rangeFields" className="grid grid-cols-2 gap-3">
          <div>
            <label>Dari Tanggal</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              {...register("startDate")}
            />
            {errors.startDate?.message && (
              <p className="text-xs text-red-400">
                {errors.startDate.message.toString()}
              </p>
            )}
          </div>

          <div>
            <label>Sampai Tanggal</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              {...register("endDate")}
            />
            {errors.endDate?.message && (
              <p className="text-xs text-red-400">
                {errors.endDate.message.toString()}
              </p>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full mr-2"></span>
        )}
        {isSubmitting ? "Memproses..." : "Export Pembayaran"}
      </button>

      {state?.error && <p className="text-red-600">{state.error}</p>}
    </form>
  );
}
