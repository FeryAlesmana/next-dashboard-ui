"use client";

import React, {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  mPaymentLogSchema,
  MpaymentLogSchema,
} from "@/lib/formValidationSchema";
import { CurrentState, updatePaymentLogs } from "@/lib/actions";
import { PaymentStatus } from "@prisma/client";

const FORM_KEY = "payment_log_draft_form";

export default function CreatePaymentLogPage({
  ids,
  table,
  data,
  relatedData,
  setOpen,
}: {
  ids?: number[];
  table: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data?: any;
  relatedData: any;
}) {
  // Extract selected items

  type PaymentFormDefaults = {
    paymentType?: "TUITION" | "EXTRACURRICULAR" | "UNIFORM" | "BOOKS" | "OTHER";
    amount?: number;
    dueDate?: string;
    status?: "PENDING" | "PAID" | "OVERDUE" | "PARTIALLY_PAID";
    recipientType?: "student" | "class" | "grade";
    recipientId?: string;
  };
  type PaymentItem = {
    id: number;
    studentId: string;
    amount: number;
    paymentType: "TUITION" | "EXTRACURRICULAR" | "UNIFORM" | "BOOKS" | "OTHER";
    status: "PENDING" | "PAID" | "OVERDUE" | "PARTIALLY_PAID";
    dueDate: string;
    classId: number;
    gradeId: number;
    // others are optional for this context
  };

  // If at least one selected item has a common classId or gradeId or paymentType,
  // use the values from the first one.
  // let defaultValues: PaymentFormDefaults = {
  //   paymentType: "TUITION",
  //   amount: undefined,
  //   dueDate: undefined,
  //   status: "PENDING",
  // };
  const selectedPayments = useMemo(() => {
    return data?.filter((item: PaymentItem) => ids?.includes(item.id)) || [];
  }, [data, ids]);

  console.log(selectedPayments, "Selected Payment");

  const defaultValues: PaymentFormDefaults = useMemo(() => {
    if (selectedPayments.length === 0) return {};

    const first = selectedPayments[0];

    const hasSameClass = selectedPayments.every(
      (p: PaymentItem) => p.classId === first.classId
    );
    const hasSameGrade = selectedPayments.every(
      (p: PaymentItem) => p.gradeId === first.gradeId
    );
    const hasSamePaymentType = selectedPayments.every(
      (p: PaymentItem) => p.paymentType === first.paymentType
    );

    let recipientType: "student" | "class" | "grade" | undefined;
    let recipientId: string | undefined;

    if (selectedPayments.length === 1) {
      recipientType = "student";
      recipientId = selectedPayments[0].studentId;
    } else if (hasSameClass) {
      recipientType = "class";
      recipientId = first.classId;
    } else if (hasSameGrade) {
      recipientType = "grade";
      recipientId = first.gradeId;
    }

    if (hasSameClass || hasSameGrade || hasSamePaymentType) {
      return {
        paymentType: first.paymentType as MpaymentLogSchema["paymentType"],
        amount: first.amount,
        dueDate: new Date(first.dueDate).toISOString().split("T")[0],
        status: first.status as MpaymentLogSchema["status"],
        recipientType,
        recipientId,
      };
    }

    return {};
  }, [selectedPayments]);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MpaymentLogSchema>({
    resolver: zodResolver(mPaymentLogSchema),
    defaultValues: {
      ids,
      recipientType: defaultValues.recipientType,
      recipientId: defaultValues.recipientId,
    },
  });

  const updatePaymentLogsHandler = async (
    prevState: CurrentState,
    payload: MpaymentLogSchema
  ): Promise<CurrentState> => {
    return await updatePaymentLogs(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    updatePaymentLogsHandler,
    initialState
  );

  const watchedValues = watch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (Object.keys(defaultValues).length > 0) {
      reset({
        ids: ids || [],
        ...defaultValues,
      });
    }
  }, [reset, ids, defaultValues]);

  useEffect(() => {
    if (state.success) {
      toast(`Tagihan berhasil di Edit!`);
      setOpen(false);
      router.refresh();
    } else {
      setIsSubmitting(false);
    }
  }, [state, setOpen, router]);
  //   useEffect(() => {
  //     if (ids && ids.length > 0) {
  //       setValue("ids", ids);
  //     }
  //   }, [ids, setValue]);

  // Muat data siswa, kelas, dan angkatan
  const { classData = [], studentData = [] } = relatedData ?? [];

  console.log(ids, "Isi ids");

  type Grade = { id: number; level: number };
  type ClassWithGrade = { grade?: Grade };
  const gradeData: Grade[] =
    (classData as ClassWithGrade[])
      ?.filter((c): c is { grade: Grade } => !!c.grade && !!c.grade.id)
      .map((c) => ({
        id: c.grade.id,
        level: c.grade.level,
      }))
      .filter(
        (grade, index, self) =>
          self.findIndex((g) => g.id === grade.id) === index
      ) || [];

  if (!ids || ids.length === 0) {
    return <span>Tidak ada data yang dipilih.</span>;
  }

  const onSubmit = handleSubmit((data) => {
    setIsSubmitting(true);

    startTransition(() => {
      formAction(data);
    });
  });

  console.log(defaultValues, " defaultvalues in form");

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="border border-gray-300 rounded-lg p-6 shadow-sm bg-white space-y-6 text-black">
        <h1 className="text-lg font-semibold text-center">
          Edit Banyak Tagihan
        </h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="table" value={table} />
          {ids?.map((id, index) => (
            <input
              key={id}
              type="hidden"
              value={id}
              {...register(`ids.${index}` as const)}
            />
          ))}
          <span className="text-center font-medium">
            {ids.length} Pembayaran akan diperbarui.
          </span>
          <div>
            <label className="block mb-1 font-medium">Jenis Pembayaran</label>
            <select
              {...register("paymentType")}
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
          <span className="items-center justify-center text-center">
            {" "}
            TUNAI
          </span>

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
                  (student: { id: string; name: string; surname: string }) => (
                    <option key={student.id} value={student.id}>
                      {student.name} {student.surname}
                    </option>
                  )
                )}
              {watchedValues.recipientType === "class" &&
                classData.map(
                  (kelas: {
                    id: number;
                    name: string;
                    // capacity: number;
                    // _count: { students: number };
                  }) => (
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

          {errors.ids && <p className="text-red-600">{errors.ids.message}</p>}

          <div className="text-center pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full mr-2"></span>
              )}
              {isSubmitting ? "Memproses..." : "Update Tagihan"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-gray-300 text-black font-semibold px-6 py-3 rounded hover:bg-gray-400 ml-4"
            >
              Batal
            </button>
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
        </form>
      </div>
    </div>
  );
}
