"use client";

import React, {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import ConfirmDialog from "../ConfirmDialog";
import { paymentLogSchema, PaymentLogSchema } from "@/lib/formValidationSchema";
import {
  createPaymentLog,
  CurrentState,
  updatePaymentLog,
} from "@/lib/actions";

const FORM_KEY = "payment_log_draft_form";

export default function CreatePaymentLogPage({
  data,
  type,
  relatedData,
  setOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  data?: any;
  type: "create" | "update";
  relatedData: any;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
    getValues,
  } = useForm<PaymentLogSchema>({
    resolver: zodResolver(paymentLogSchema),
    defaultValues: {
      paymentType: "TUITION",
      amount: 0,
      dueDate: "",
      status: "PENDING",
      description: "",
      paymentMethod: "",
      receiptNumber: "",
      recipientType: "student",
      recipientId: "",
    },
  });

  const createPaymentLogHandler = async (
    prevState: CurrentState,
    payload: PaymentLogSchema
  ): Promise<CurrentState> => {
    return await createPaymentLog(prevState, payload);
  };

  const updatePaymentLogHandler = async (
    prevState: CurrentState,
    payload: PaymentLogSchema
  ): Promise<CurrentState> => {
    return await updatePaymentLog(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    type === "create" ? createPaymentLogHandler : updatePaymentLogHandler,
    initialState
  );

  const watchedValues = watch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk menampilkan dialog konfirmasi
  const [showConfirm, setShowConfirm] = useState(false);
  // Simpan data form saat submit awal agar dipakai saat konfirmasi
  const [formData, setFormData] = useState<PaymentLogSchema | null>(null);

  // Simpan draft ke localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(FORM_KEY, JSON.stringify(watchedValues));
    }, 500);

    return () => clearTimeout(timeout);
  }, [watchedValues]);

  // Muat draft dari localStorage atau data untuk update
  useEffect(() => {
    const saved = localStorage.getItem(FORM_KEY);
    if (saved) {
      const values = JSON.parse(saved);
      for (const key in values) {
        setValue(key as keyof PaymentLogSchema, values[key]);
      }
    }

    if (type === "update" && data) {
      reset({
        paymentType: data.paymentType ?? "TUITION",
        amount: data.amount ?? 0,
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString().split("T")[0]
          : "",
        status: data.status ?? "PENDING",
        description: data.description ?? "",
        paymentMethod: data.paymentMethod ?? "",
        receiptNumber: data.receiptNumber ?? "",
        recipientType: data.studentId
          ? "student"
          : data.classId
          ? "class"
          : "grade",
        recipientId: data.studentId ?? data.classId ?? data.gradeId ?? "",
      });
    }
  }, [setValue, reset, data, type]);

  // Muat data siswa, kelas, dan angkatan
  const {
    classData = [],
    studentData = [],
    gradeData = [],
  } = relatedData ?? [];

  // Submit final setelah konfirmasi
  const handleSubmitForm = handleSubmit((formData) => {
    setIsSubmitting(true);
    setShowConfirm(false);
    startTransition(() => {
      formAction(formData);
    });
  });

  // Submit awal: validasi → kalau valid munculkan dialog
  const onSubmit = async () => {
    const valid = await trigger();
    if (valid) {
      const values = getValues();
      setFormData(values);
      setShowConfirm(true);
    } else {
      setShowConfirm(false);
    }
  };

  useEffect(() => {
    if (state.success) {
      toast(`Tagihan berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`);
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="border border-gray-300 rounded-lg p-6 shadow-sm bg-white space-y-6 text-black">
        <h1 className="text-lg font-semibold text-center">
          {type === "create" ? "Buat Tagihan Baru" : "Edit Tagihan"}
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 font-medium">Jenis Pembayaran</label>
            <select
              {...register("paymentType")}
              defaultValue={data?.paymentType || "TUITION"}
              className="w-full border rounded px-3 py-2"
            >
              <option value="TUITION">SPP</option>
              <option value="EXTRACURRICULAR">Ekstrakurikuler</option>
              <option value="UNIFORM">Seragam</option>
              <option value="BOOKS">Buku</option>
              <option value="OTHER">Lainnya</option>
            </select>
            {errors.paymentType && (
              <p className="text-red-600">{errors.paymentType.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Jumlah (IDR)</label>
            <input
              type="number"
              {...register("amount", { valueAsNumber: true })}
              className="w-full border rounded px-3 py-2"
            />
            {errors.amount && (
              <p className="text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Tenggat Waktu</label>
            <input
              type="date"
              {...register("dueDate")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.dueDate && (
              <p className="text-red-600">{errors.dueDate.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              {...register("status")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="PENDING">Menunggu</option>
              <option value="PAID">Lunas</option>
              <option value="OVERDUE">Terlambat</option>
              <option value="PARTIALLY_PAID">Sebagian Dibayar</option>
            </select>
            {errors.status && (
              <p className="text-red-600">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Deskripsi (Opsional)
            </label>
            <textarea
              {...register("description")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.description && (
              <p className="text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Metode Pembayaran</label>
            <input
              type="text"
              {...register("paymentMethod")}
              hidden
              className="w-full border rounded px-3 py-2"
            />
            {errors.paymentMethod && (
              <p className="text-red-600">{errors.paymentMethod.message}</p>
            )}
          </div>
          <span className="items-center justify-center text-center"> TUNAI</span>

          <div>
            <label className="block mb-1 font-medium">
              Nomor Kuitansi (Opsional)
            </label>
            <input
              type="text"
              {...register("receiptNumber")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.receiptNumber && (
              <p className="text-red-600">{errors.receiptNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Tipe Penerima</label>
            <select
              {...register("recipientType")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="student">Satu Siswa</option>
              <option value="class">Satu Kelas</option>
              <option value="grade">Satu Angkatan</option>
            </select>
            {errors.recipientType && (
              <p className="text-red-600">{errors.recipientType.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Penerima</label>
            <select
              {...register("recipientId")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Pilih Penerima</option>
              {watchedValues.recipientType === "student" &&
                studentData.map(
                  (student: { id: string; name: string; namalengkap: string }) => (
                    <option key={student.id} value={student.id}>
                      {student.name} {student.namalengkap}
                    </option>
                  )
                )}
              {watchedValues.recipientType === "class" &&
                classData.map(
                  (kelas: { id: number; name: string }) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.name}
                    </option>
                  )
                )}
              {watchedValues.recipientType === "grade" &&
                gradeData.map((grade: { id: number; level: number }) => (
                  <option key={grade.id} value={grade.id}>
                    Angkatan {grade.level}
                  </option>
                ))}
            </select>
            {errors.recipientId && (
              <p className="text-red-600">{errors.recipientId.message}</p>
            )}
          </div>

          {data?.id && (
            <input hidden type="number" {...register("id")} value={data.id} />
          )}
          {errors.id && <p className="text-red-600">{errors.id.message}</p>}

          <div className="text-center pt-4">
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
                ? "Buat Tagihan"
                : "Update Tagihan"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-gray-300 text-black font-semibold px-6 py-3 rounded hover:bg-gray-400 ml-4"
            >
              Batal
            </button>
          </div>
        </form>
      </div>

      {showConfirm && (
        <ConfirmDialog
          message={
            type === "create"
              ? "Tambah tagihan baru?"
              : "Simpan perubahan tagihan?"
          }
          onConfirm={handleSubmitForm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}