import { Controller } from "react-hook-form";
import { RupiahInput } from "./RupiahInput";
import { QuickAddButtons } from "./QuickActButton";

export const PartialPaymentFields = ({
  register,
  watch,
  setValue,
  errors,
  remainingAmount,
  control,
}: any) => {
  const installments = watch("installments") || [];
  const count = installments.length;

  const total = installments.reduce(
    (sum: number, x: any) => sum + Number(x.amount || 0),
    0
  );

  return (
    <div className="space-y-4 mt-2 p-3 border rounded bg-gray-50">
      <button
        type="button"
        disabled={remainingAmount <= 0}
        className={`px-3 py-2 rounded text-white mb-3 ${
          remainingAmount <= 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500"
        }`}
        onClick={() => {
          if (remainingAmount <= 0) return; // safety check

          setValue("installments", [
            { amount: null, paidAt: "" },
            ...installments,
          ]);
        }}
      >
        + Tambah Cicilan
      </button>

      {remainingAmount <= 0 && (
        <p className="text-red-600 text-sm font-medium">
          Total tagihan sudah lunas — tidak dapat menambah cicilan lagi.
        </p>
      )}

      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 border rounded bg-white">
          <p className="font-medium mb-2">Pembayaran #{i + 1}</p>

          <label className="text-sm">Jumlah Dibayar</label>
          <Controller
            control={control}
            name={`installments.${i}.amount`}
            render={({ field }) => (
              <div>
                <RupiahInput
                  value={field.value}
                  onChange={(num: any) => field.onChange(num)}
                />
                <QuickAddButtons
                  current={field.value}
                  onChange={(num: any) =>
                    setValue(`installments.${i}.amount`, num)
                  }
                />
              </div>
            )}
          />

          <label className="text-sm">Tanggal Pembayaran</label>
          <input
            type="date"
            {...register(`installments.${i}.paidAt`)}
            className="border rounded p-2 w-full"
          />
        </div>
      ))}
      {count !== 0 ? (
        <button
          type="button"
          onClick={() => {
            // re-set the installments array to trigger useEffect
            setValue("installments", [...installments], {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
          }}
          className="px-3 py-2 mt-2 rounded bg-green-600 text-white"
        >
          Save Installments
        </button>
      ) : (
        []
      )}

      {/* Installment-level and field-level errors */}
      {errors.installments && (
        <div className="text-red-600 text-sm space-y-1 mt-2">
          {Array.isArray(errors.installments) &&
            errors.installments.map((err: any, i: number) => (
              <div key={i}>
                {err?.amount?.message && (
                  <p>
                    Pembayaran #{i + 1}: {err.amount.message}
                  </p>
                )}
                {err?.paidAt?.message && (
                  <p>
                    Pembayaran #{i + 1}: {err.paidAt.message}
                  </p>
                )}
              </div>
            ))}

          {/* If Zod reports a top-level error (e.g. "installments exceed remaining") */}
          {typeof errors.installments.message === "string" && (
            <p>{errors.installments.message}</p>
          )}
        </div>
      )}

      {/* validation preview */}
      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
        <span className="text-gray-500">
          Sisa Tagihan: IDR {remainingAmount?.toLocaleString("id-ID") || 0}
        </span>
        <span
          className={`font-semibold ${
            total > remainingAmount ? "text-red-600" : "text-green-600"
          }`}
        >
          Total Input: IDR {total.toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
};
