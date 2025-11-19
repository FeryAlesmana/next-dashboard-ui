"use client";
import { useState } from "react";

export default function PaymentInstallmentsPreview({
  installments,
  totalAmount,
  limit = 1,
}: {
  installments: {
    amount: any;
    paidAt: Date | null;
  }[];
  totalAmount: number;
  limit?: number;
}) {
  const [open, setOpen] = useState(false);

  if (!installments || installments.length === 0) {
    return (
      <span className="text-gray-400 italic text-xs">Belum ada pembayaran</span>
    );
  }

  // Format
  const formatted = installments.map((i) => {
    const paidAt = i.paidAt
      ? new Date(i.paidAt).toLocaleDateString("id-ID")
      : "Belum dibayar";

    return `${Number(i.amount).toLocaleString("id-ID")} (${paidAt})`;
  });

  const paidTotal = installments.reduce((s, i) => s + Number(i.amount), 0);
  const remaining = totalAmount - paidTotal;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="text-blue-600 underline text-xs"
      >
        {installments.length} pembayaran
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-md p-4 max-h-[70vh] overflow-y-auto text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-3">Rincian Pembayaran</h2>

            {/* Table */}
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">#</th>
                  <th className="border px-2 py-1 text-left">Jumlah</th>
                  <th className="border px-2 py-1 text-left">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((i, idx) => {
                  const formattedAmount = Number(i.amount).toLocaleString(
                    "id-ID",
                    {
                      style: "currency",
                      currency: "IDR",
                    }
                  );

                  const date = i.paidAt
                    ? new Date(i.paidAt).toLocaleDateString("id-ID")
                    : "Belum dibayar";

                  return (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{idx + 1}</td>
                      <td className="border px-2 py-1">{formattedAmount}</td>
                      <td className="border px-2 py-1">{date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary */}
            <div className="mt-3 text-gray-700 text-sm border-t pt-2">
              <div>
                Total Dibayar:{" "}
                <strong>
                  {installments
                    .reduce((s, i) => s + Number(i.amount), 0)
                    .toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                </strong>
              </div>
              <div>
                Sisa:{" "}
                <strong>
                  {(
                    totalAmount -
                    installments.reduce((s, i) => s + Number(i.amount), 0)
                  ).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })}
                </strong>
              </div>
            </div>

            <button
              className="mt-3 text-xs text-blue-600 underline"
              onClick={() => setOpen(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
