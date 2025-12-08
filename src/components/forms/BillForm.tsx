// BillForm.jsx
"use client";

import { Controller, useForm } from "react-hook-form";
import { BaseFormProps } from "./AssignmentForm";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect, useState } from "react";
import { createBill, CurrentState, updateBill } from "@/lib/actions";
import { toast } from "react-toastify";
import { RupiahInput } from "../RupiahInput";
import { QuickAddButtons } from "../QuickActButton";
import Select from "react-select";
import ConfirmDialog from "../ConfirmDialog";
import { billLogSchema, BillLogSchema } from "@/lib/formValidationSchema";

export default function BillForm({
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
  } = useForm<BillLogSchema>({
    resolver: zodResolver(billLogSchema),
    defaultValues: {
      paymentType: data.paymentType,
      amount: data.amount,
      dueDate: data.dueDate
        ? new Date(data.dueDate).toISOString().split("T")[0]
        : "",
      description: data.description ?? "",
      recipientType: "student",
      recipientId: data.studentId,
    },
  });

  const createBillHandler = async (
    prevState: CurrentState,
    payload: BillLogSchema
  ): Promise<CurrentState> => {
    return await createBill(prevState, payload);
  };

  const updateBillLogHandler = async (
    prevState: CurrentState,
    payload: BillLogSchema
  ): Promise<CurrentState> => {
    return await updateBill(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    type === "create" ? createBillHandler : updateBillLogHandler,
    initialState
  );

  const watchedValues = watch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk menampilkan dialog konfirmasi
  const [showConfirm, setShowConfirm] = useState(false);
  // Simpan data form saat submit awal agar dipakai saat konfirmasi
  const [formData, setFormData] = useState<BillLogSchema | null>(null);

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

  const {
    classData = [],
    studentData = [],
    gradeData = [],
  } = relatedData ?? [];

  console.log(data, "data in Bill Form");
  console.log(relatedData, "relatedData in Bill Form");

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
            <label className="block mb-1 font-medium">Total Tagihan</label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <div>
                  <RupiahInput value={field.value} onChange={field.onChange} />

                  <QuickAddButtons
                    current={field.value}
                    onChange={(num: number) =>
                      setValue("amount", num, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
              )}
            />
            {errors.amount && (
              <p className="text-red-600">{errors.amount.message}</p>
            )}
          </div>
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

            {watchedValues.recipientType === "student" ? (
              <Controller
                name="recipientId"
                control={control}
                defaultValue={data?.recipientId || ""}
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
                  />
                )}
              />
            ) : (
              <select
                {...register("recipientId")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Pilih Penerima</option>
                {watchedValues.recipientType === "class" &&
                  classData.map((kelas: { id: number; name: string }) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.name}
                    </option>
                  ))}
                {watchedValues.recipientType === "grade" &&
                  gradeData.map((grade: { id: number; level: number }) => (
                    <option key={grade.id} value={grade.id}>
                      Angkatan {grade.level}
                    </option>
                  ))}
              </select>
            )}

            {errors.recipientId && (
              <p className="text-red-600">{errors.recipientId.message}</p>
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
                  ? "Buat Tagihan"
                  : "Update Tagihan"}
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
