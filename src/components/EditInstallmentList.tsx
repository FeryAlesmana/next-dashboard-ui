"use client";

import { useEffect, useState } from "react";
import { RupiahInput } from "./RupiahInput";
import { QuickAddButtons } from "./QuickActButton";

export default function EditInstallmentsList({
  watch,
  control,
  installments,
  setValue,
  errors,
  remainingAmount,
}: any) {
  const [items, setItems] = useState<
    { id: number; amount: number; paidAt: string | null }[]
  >([]);

  // 🔥 Sync with parent when installments change
  useEffect(() => {
    const mapped = installments.map((i: any) => ({
      ...i,
      paidAt: i.paidAt ? new Date(i.paidAt).toISOString().split("T")[0] : "",
    }));

    setItems(mapped);
    setValue("installments", mapped); // sync with RHF
  }, [installments, setValue]);

  const winstall = watch("installments") || [];
  const total = winstall.reduce(
    (sum: number, x: any) => sum + Number(x.amount || 0),
    0
  );

  const existingTotal = installments.reduce(
    (sum: number, x: any) => sum + Number(x.amount),
    0
  );

  const maxEditable = existingTotal + remainingAmount;
  const isInvalid = total > maxEditable;

  const updateItem = (index: number, field: any, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);

    // update React Hook Form
    setValue("installments", updated);
  };

  return (
    <div className="space-y-4 mt-4 p-3 border rounded bg-gray-50">
      <h3 className="font-semibold text-sm">Edit Cicilan</h3>

      {items.length === 0 && (
        <p className="text-sm text-gray-500">Tidak ada cicilan untuk diedit.</p>
      )}

      {items.map((item: any, index: number) => (
        <div
          key={item.id || index}
          className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-white p-3 rounded border"
        >
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Jumlah</label>

            <RupiahInput
              value={item.amount}
              onChange={(num: any) => updateItem(index, "amount", num)}
            />

            <QuickAddButtons
              current={item.amount}
              onChange={(num: any) => updateItem(index, "amount", num)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Tanggal Bayar</label>
            <input
              type="date"
              className="border px-2 py-1 rounded"
              value={item.paidAt}
              onChange={(e) => updateItem(index, "paidAt", e.target.value)}
            />
          </div>
        </div>
      ))}
      {errors.installments && (
        <div className="text-red-600 text-sm space-y-1 mt-2">
          {Object.entries(errors.installments).map(([key, val]: any, i) => {
            if (!val) return null;
            if (Array.isArray(val)) return null; // handled elsewhere

            if (typeof val.message === "string") {
              return <p key={i}>{val.message}</p>;
            }

            return null;
          })}
        </div>
      )}
      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
        <span className="text-gray-500">
          Maksimal: IDR {maxEditable.toLocaleString("id-ID")}
        </span>

        <span
          className={`font-semibold ${
            isInvalid ? "text-red-600" : "text-green-600"
          }`}
        >
          Total Input: IDR {total.toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
}
