// NewPaymentForm.jsx
"use client";

import { Controller, useForm } from "react-hook-form";
import { BaseFormProps } from "./AssignmentForm";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect, useState } from "react";
import { createPayment, CurrentState, updatePayment } from "@/lib/actions";
import { toast } from "react-toastify";
import { RupiahInput } from "../RupiahInput";
import { QuickAddButtons } from "../QuickActButton";
import Select from "react-select";
import ConfirmDialog from "../ConfirmDialog";
import { paymentSchema, PaymentSchema } from "@/lib/formValidationSchema";
import InstallmentPopover from "../InstallmentPopover";
import { PartialPaymentFields } from "../PartialPaymentFields";
import EditInstallmentsList from "../EditInstallmentList";

export default function NewPaymentForm({
  data,
  type,
  relatedData,
  setOpen,
  onChanged,
}: BaseFormProps) {
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
    control,
  } = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: data.paymentMethod ?? "",
      receiptNumber: data.receiptNumber ?? "",
      recipientType: "student",
      paidAt: data.paidAt
        ? new Date(data.paidAt).toISOString().split("T")[0]
        : "",
      installments: [],
      dueDate: data.dueDate
        ? new Date(data.dueDate).toISOString().split("T")[0]
        : "",
      recipientId: data.studentId,
      amountPaid: data.amount,
      amount: data.amount,
    },
  });

  const createPaymentHandler = async (
    prevState: CurrentState,
    payload: PaymentSchema
  ): Promise<CurrentState> => {
    return await createPayment(prevState, payload);
  };

  const updatePaymentHandler = async (
    prevState: CurrentState,
    payload: PaymentSchema
  ): Promise<CurrentState> => {
    return await updatePayment(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };

  const { studentData = [], installment, remainingAmount } = relatedData ?? [];
  const paymentLogId = data?.id ?? null;
  const usedInstallment = Array.isArray(installment)
    ? paymentLogId
      ? installment.filter((inst) => inst.paymentLogId === paymentLogId)
      : []
    : [];
  const [LoadedInstallment, setLoadedInstallment] = useState(usedInstallment);
  const [state, formAction] = useActionState(
    type === "create" ? createPaymentHandler : updatePaymentHandler,
    initialState
  );

  const watchedValues = watch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recipientIds = watchedValues.recipientType || [];
  const isMultipleRecipients = recipientIds !== "student";
  const safeRemainingAmount = remainingAmount[data.id];
  // State untuk menampilkan dialog konfirmasi
  const [showConfirm, setShowConfirm] = useState(false);
  // Simpan data form saat submit awal agar dipakai saat konfirmasi
  const [formData, setFormData] = useState<PaymentSchema | null>(null);

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
      const updatedItem = state.data ?? formData;
      toast(`Tagihan berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`);
      setOpen(false);
      if (onChanged && updatedItem) {
        onChanged(updatedItem); // 🔥 notify parent so it can update localData
      } else {
        router.refresh(); // fallback if no handler passed
      }
      router.refresh();
    }
  }, [state, type, setOpen, router, onChanged, formData]);
  console.log(safeRemainingAmount, "remainingAmount in payment Form");
  console.log(remainingAmount[data.id], "remainingAmount id in payment Form");
  console.log(relatedData, "relatedData in payment Form");
  if (data.status === "PAID" && type === "create") {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-center mb-2">
            Tagihan sudah Lunas
          </h1>
          <p className="text-center">
            Pembayaran tidak dapat dibuat atau ditambahkan karena tagihan sudah
            berstatus <strong>Lunas</strong>.
          </p>
        </div>
      </div>
    );
  }
  console.log(errors, "error in payment Form");
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="border border-gray-300 rounded-lg p-6 shadow-sm bg-white space-y-6 text-black">
        <h1 className="text-lg font-semibold text-center">
          {type === "create" ? "Buat Pembayaran Baru" : "Edit Pembayaran"}
        </h1>
        <div
          className={`px-2 py-1 rounded-full font-semibold text-center
              ${
                data.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : ""
              }
              ${data.status === "PAID" ? "bg-green-100 text-green-800" : ""}
              ${data.status === "OVERDUE" ? "bg-red-100 text-red-800" : ""}
              ${
                data.status === "PARTIALLY_PAID"
                  ? "bg-blue-100 text-blue-800"
                  : ""
              }
            `}
        >
          {" "}
          {data.status === "PENDING" && "Belum Dibayar"}
          {data.status === "PAID" && "Lunas"}
          {data.status === "OVERDUE" && "Terlambat"}
          {data.status === "PARTIALLY_PAID" && "Dibayar Sebagian"}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 font-medium">Metode Pembayaran</label>
            <select
              {...register("paymentMethod")}
              className="w-full border rounded px-3 py-2 bg-white"
              defaultValue=""
            >
              <option value="">Pilih Metode</option>
              <option value="Tunai">Tunai</option>
              <option value="Transfer">Transfer Bank</option>
              <option value="QRIS">QRIS</option>
              <option value="Debit">Debit</option>

              {/* Disable Cicilan when >1 recipients */}
              <option value="Cicilan" disabled={isMultipleRecipients}>
                Cicilan {isMultipleRecipients ? "(Hanya untuk 1 siswa)" : ""}
              </option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Total Tagihan</label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <div>
                  <RupiahInput
                    value={field.value}
                    onChange={field.onChange}
                    disabled={true}
                  />
                </div>
              )}
            />
            {errors.amount && (
              <p className="text-red-600">{errors.amount.message}</p>
            )}
          </div>
          {watchedValues.paymentMethod !== "Cicilan" && (
            <div>
              <label className="block mb-1 font-medium">Total Dibayar</label>
              <Controller
                name="amountPaid"
                control={control}
                render={({ field }) => (
                  <div>
                    <RupiahInput
                      value={field.value}
                      onChange={field.onChange}
                      disabled={true}
                    />
                  </div>
                )}
              />
              {errors.amountPaid && (
                <p className="text-red-600">{errors.amountPaid.message}</p>
              )}
            </div>
          )}

          {watchedValues.paymentMethod === "Cicilan" && type === "create" && (
            <>
              <InstallmentPopover
                relatedInstallments={LoadedInstallment}
                onDeleted={(id) => {
                  setLoadedInstallment((prev) =>
                    prev.filter((i) => i.id !== id)
                  );
                  setValue(
                    "installments",
                    usedInstallment.filter((i) => i.id !== id)
                  );
                }}
              />
              <PartialPaymentFields
                control={control}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                remainingAmount={safeRemainingAmount}
              />
            </>
          )}
          {watchedValues.paymentMethod === "Cicilan" && type === "update" && (
            <>
              <InstallmentPopover
                relatedInstallments={LoadedInstallment}
                onDeleted={(id) => {
                  setLoadedInstallment((prev) =>
                    prev.filter((i) => i.id !== id)
                  );
                  setValue(
                    "installments",
                    usedInstallment.filter((i) => i.id !== id)
                  );
                }}
              />
              <EditInstallmentsList
                control={control}
                register={register}
                installments={LoadedInstallment}
                setValue={setValue}
                watch={watch}
                errors={errors}
                remainingAmount={safeRemainingAmount}
              />
            </>
          )}

          <div>
            <label className="block mb-1 font-medium">Jenis Pembayaran</label>
            <select
              {...register("paymentType")}
              defaultValue={data?.paymentType || "TUITION"}
              className="w-full border rounded px-3 py-2"
              disabled
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
            <label className="block mb-1 font-medium">Tenggat Waktu</label>
            <input
              type="date"
              {...register("dueDate")}
              className="w-full border rounded px-3 py-2"
              disabled
            />
            {errors.dueDate && (
              <p className="text-red-600">{errors.dueDate.message}</p>
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

          <div className="hidden">
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

            <Controller
              name="recipientId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={studentData.map(
                    (student: { id: string; name: string }) => ({
                      value: student.id,
                      label: student.name,
                    })
                  )}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari Siswa..."
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value ?? "")
                  }
                  value={
                    studentData
                      .map((student: { id: string; name: string }) => ({
                        value: student.id,
                        label: student.name,
                      }))
                      .find((opt: any) => opt.value === field.value) || null
                  }
                  isClearable
                  isSearchable
                  isDisabled
                />
              )}
            />

            {errors.recipientId && (
              <p className="text-red-600">{errors.recipientId.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Tanggal Pembayaran</label>
            <input
              type="date"
              {...register("paidAt")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.paidAt && (
              <p className="text-red-600">{errors.paidAt.message}</p>
            )}
          </div>

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

          {data?.id && (
            <input hidden type="number" {...register("id")} value={data.id} />
          )}
          {errors.id && <p className="text-red-600">{errors.id.message}</p>}

          <div className="text-center pt-4">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 w-full lg:w-auto flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full"></span>
                )}
                {isSubmitting
                  ? "Memproses..."
                  : type === "create"
                  ? "Simpan Pembayaran"
                  : "Update Pembayaran"}
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="bg-gray-300 text-black font-semibold px-6 py-3 rounded hover:bg-gray-400 w-full lg:w-auto"
              >
                Batal
              </button>
            </div>
          </div>
        </form>
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
