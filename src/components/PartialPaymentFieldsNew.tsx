"use client";

import { FieldErrors } from "react-hook-form";
import InputField from "./InputField";

type PartialPaymentFieldsProps = {
  register: any;
  watch: any;
  setValue: any;
  // We keep this generic, but we handle the specific array logic inside
  errors: FieldErrors<any>;
  remainingAmount: number;
};

export const NewPartialPaymentFields = ({
  register,
  watch,
  setValue,
  errors,
  remainingAmount,
}: PartialPaymentFieldsProps) => {
  const installments = watch("installments") || [];
  const count = installments.length;

  /**
   * Add a new empty installment (no id = new record)
   */
  const addInstallment = () => {
    const newInstallments = [
      ...installments,
      {
        // No id - signals it's a NEW installment to server
        amount: 0,
        paidAt: "",
        isEdited: true, // Mark as edited since user just added it
      },
    ];
    setValue("installments", newInstallments, { shouldValidate: true });
  };

  /**
   * Remove an installment by index
   */
  const removeInstallment = (index: number) => {
    const newInstallments = installments.filter((_: any, i: number) => i !== index);
    setValue("installments", newInstallments, { shouldValidate: true });
  };

  /**
   * Calculate total of edited/new installments (amount > 0)
   * Only edited or new (no id) installments count toward the total
   */
  const total = installments
    .filter((x: any) => x.isEdited || !x.id) // edited items OR new items (no id)
    .reduce((sum: number, x: any) => sum + Number(x.amount || 0), 0);

  // --- Handle Root/Global Errors ---
  const installmentsError = errors?.installments as any;
  const rootErrorMessage =
    typeof installmentsError?.message === "string"
      ? installmentsError.message
      : installmentsError?.root?.message;

  return (
    <div className="space-y-4 mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">Pembayaran Bertahap</h3>
        <button
          type="button"
          onClick={addInstallment}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Tambah Pembayaran
        </button>
      </div>

      {count === 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
          ℹ️ Belum ada pembayaran. Klik &quot;Tambah Pembayaran&quot; untuk menambahkan.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {installments.map((inst: any, i: number) => {
          const isNew = !inst.id; // NEW installment (no id in DB yet)
          const hasExistingInstallments = installments.some((x: any) => x.id); // Check if there are any DB installments
          const isDisabled = !isNew && hasExistingInstallments; // Disable existing ones when there are DB records
          
          // --- Handle Array Indexing Errors ---
          const errorList = errors?.installments as any;
          const amountError = errorList?.[i]?.amount;
          const dateError = errorList?.[i]?.paidAt;

          const handleAmountChange = () => {
            if (!isDisabled) {
              const arr = [...installments];
              arr[i] = { ...arr[i], isEdited: true };
              setValue("installments", arr, { shouldValidate: true });
            }
          };

          const handleDateChange = () => {
            if (!isDisabled) {
              const arr = [...installments];
              arr[i] = { ...arr[i], isEdited: true };
              setValue("installments", arr, { shouldValidate: true });
            }
          };

          return (
            <div
              key={i}
              className={`p-4 border rounded-md shadow-sm flex flex-col md:flex-row gap-4 items-start ${
                isNew ? "bg-blue-50 border-blue-200" : isDisabled ? "bg-gray-100 border-gray-300 opacity-60" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex-1 w-full">
                <InputField
                  label={`Pembayaran #${i + 1} (Nominal) ${isNew ? "[BARU]" : ""}`}
                  name={`installments.${i}.amount`}
                  type="number"
                  register={register}
                  error={amountError}
                  placeholder="0"
                  table="paymentLog"
                  inputProps={{
                    disabled: isDisabled,
                    onChange: handleAmountChange,
                  }}
                />
              </div>

              <div className="flex-1 w-full">
                <InputField
                  label="Tanggal Pembayaran"
                  name={`installments.${i}.paidAt`}
                  type="date"
                  register={register}
                  error={dateError}
                  table="paymentLog"
                  inputProps={{
                    disabled: isDisabled,
                    onChange: handleDateChange,
                  }}
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => removeInstallment(i)}
                  disabled={isDisabled}
                  className={`px-3 py-2 text-sm rounded h-10 ${
                    isDisabled
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  Hapus
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Root/Global Errors */}
      {rootErrorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm font-medium">
          ⚠️ {rootErrorMessage}
        </div>
      )}

      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
        <span className="text-gray-500">Sisa Tagihan: IDR {remainingAmount?.toLocaleString('id-ID') || 0}</span>
        <span
          className={`font-semibold ${
            total > remainingAmount ? "text-red-600" : "text-green-600"
          }`}
        >
          Total Input: IDR {total.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  );
};
