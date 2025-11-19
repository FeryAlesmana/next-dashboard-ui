"use client";
import {
  CurrentState,
  importPayments,
  importStudents,
  importTeachers,
} from "@/lib/actions";
import {
  importPaymentsschema,
  ImportPaymentsSchema,
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

const ImportPaymentsForm = ({
  setOpen,
  data,
  onChanged,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: any;
  onChanged?: (item: any) => void;
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ImportPaymentsSchema>({
    resolver: zodResolver(importPaymentsschema),
  });

  const importPaymentsHandler = async (
    prevState: CurrentState,
    payload: ImportPaymentsSchema
  ): Promise<CurrentState> => {
    return await importPayments(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
    skipped: null,
  };
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, formAction] = useActionState(
    importPaymentsHandler,
    initialState
  );

  const handleSubmitForm = handleSubmit((data) => {
    setIsSubmitting(true);
    startTransition(() => {
      formAction(data);
    });
  });
  const router = useRouter();

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);
  useEffect(() => {
    if (state.success) {
      toast.success(`✅ ${state.message}`);

      // If some items were skipped, show them
      if (state.skipped && state.skipped.length > 0) {
        let skippedMsg = "🚫 Data dilewati:\n";
        skippedMsg += state.skipped
          .map((s: any) => `• NISN: ${s.nisn || "-"} — ${s.reason}`)
          .join("\n");

        toast.error(skippedMsg, {
          autoClose: false,
        });
        if (state.data && onChanged) {
          console.log(state.data, "imported data");

          onChanged(state.data);
          router.refresh();
        }
        setOpen(false);
        reset();
        router.refresh();
      } else if (state.error) {
        toast(`❌ Import gagal: ${state.message}`);
      }
    }
  }, [state, reset, setOpen, onChanged, router]);

  return (
    <form
      onSubmit={handleSubmitForm}
      className="p-4 border rounded-md space-y-3 "
    >
      {/* Instruction box */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm p-3 rounded-md">
        <p className="font-medium mb-1">📄 Format Kolom Wajib:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <span className="font-semibold">NISN / ID Siswa</span> — digunakan
            untuk mencocokkan siswa (Wajib)
          </li>
          <li>
            <span className="font-semibold">Amount / Nominal Pembayaran</span>{" "}
            (Wajib)
          </li>
          <li>
            <span className="font-semibold">
              Payment Type / Jenis Pembayaran
            </span>{" "}
            (Wajib)
          </li>
          <li>
            <span className="font-semibold">
              Due Date / Tanggal Jatuh Tempo
            </span>{" "}
            (Wajib)
          </li>
        </ul>

        <p className="font-medium mt-3 mb-1">📌 Kolom Opsional:</p>
        <ul className="list-disc list-inside grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1">
          <li>Keterangan / Deskripsi</li>
          <li>Metode Pembayaran</li>
          <li>No. Kwitansi</li>
          <li>ID Kelas</li>
          <li>ID Tingkat</li>
        </ul>

        <p className="mt-2 text-xs text-gray-500">
          Anda dapat menggunakan berbagai variasi nama kolom seperti
          <i>
            “jumlah bayar”, “nominal pembayaran”, “jenis pembayaran”, “tgl jatuh
            tempo”
          </i>
          , dll. Sistem akan otomatis mengenali nama kolom berdasarkan variasi
          yang umum digunakan.
        </p>
      </div>

      {/* File input field */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Upload File Excel
        </label>
        <Controller
          name="file"
          control={control}
          render={({ field }) => (
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                field.onChange(file);
                setFile(file!);
              }}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          )}
        />
        {errors.file && (
          <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>
        )}
      </div>

      {/* Submit button */}
      <div className="text-center">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-md shadow hover:bg-blue-700 transition flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full"></span>
          )}
          {isSubmitting ? "Memproses..." : "Import Pembayaran"}
        </button>
      </div>
    </form>
  );
};

export default ImportPaymentsForm;
