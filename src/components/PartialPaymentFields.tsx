export const PartialPaymentFields = ({
  control,
  register,
  watch,
  setValue,
  errors,
  remainingAmount,
}: any) => {
  const count = watch("installmentCount") || 0;
  const installments = watch("installments") || [];

  function updateCount(e: any) {
    let newCount = Number(e.target.value);
    if (isNaN(newCount)) newCount = 1;

    // HARD LIMIT
    if (newCount > 6) newCount = 6;
    if (newCount < 1) newCount = 1;
    setValue("installmentCount", newCount);

    const newRows = Array.from({ length: newCount }).map((_, i) => ({
      amount: installments[i]?.amount || 0,
      paidAt: installments[i]?.paidAt || "",
    }));

    setValue("installments", newRows);
  }

  const total = installments.reduce(
    (sum: number, x: any) => sum + Number(x.amount || 0),
    0
  );

  return (
    <div className="space-y-4 mt-2 p-3 border rounded bg-gray-50">
      <label className="font-semibold text-sm">
        Jumlah Pembayaran (Installments)
      </label>
      <input
        type="number"
        min={1}
        onChange={updateCount}
        onInput={(e) => {
          if (e.currentTarget.valueAsNumber > 6) {
            e.currentTarget.value = "6";
          }
        }}
        className="border px-3 py-2 rounded w-full"
        max={6}
      />

      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 border rounded bg-white">
          <p className="font-medium mb-2">Pembayaran #{i + 1}</p>

          <label className="text-sm">Jumlah Dibayar</label>
          <input
            type="number"
            {...register(`installments.${i}.amount`, {
              valueAsNumber: true,
            })}
            className="border rounded p-2 w-full mb-2"
            min={1}
          />

          <label className="text-sm">Tanggal Pembayaran</label>
          <input
            type="date"
            {...register(`installments.${i}.paidAt`)}
            className="border rounded p-2 w-full"
          />
        </div>
      ))}
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
      <p
        className={`text-sm ${
          total > remainingAmount ? "text-red-600" : "text-green-600"
        }`}
      >
        Total Pembayaran: {total} / Sisa: {remainingAmount}
      </p>
    </div>
  );
};
