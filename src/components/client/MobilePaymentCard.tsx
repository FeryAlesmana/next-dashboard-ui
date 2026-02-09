"use client";
import { useState } from "react";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";
import { assTypes, exTypes, PaymentStatus, resTypes } from "@prisma/client";
import NameListPopover from "../NamePopover";
import Link from "next/link";
import Image from "next/image";
import PaymentInstallmentsPreview from "../PaymentInstallmentsPreview";
import { FaFileDownload } from "react-icons/fa";

export function MobilePaymentCard({
  data,
  selected,
  onToggle,
  relatedData,
  onChanged,
  onDeleted,
  role,
  allowedStaff,
  onDownload,
}: BaseTableClientProps & { onDownload?: (ids: string) => void }) {
  const [open, setOpen] = useState(false);
  let paymentStatus: PaymentStatus = "PENDING";
  let lewat: boolean = false;

  if (data.status !== "PAID" && new Date(data.dueDate) < new Date()) {
    paymentStatus = "OVERDUE";
    lewat = true;
  }
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between">
        {/* LEFT SIDE: Checkbox + Image + Text */}
        <div className="flex items-start min-w-0">
          {/* Checkbox */}
          {allowedStaff && (
            <input
              type="checkbox"
              checked={selected.includes(data.id)}
              onChange={() => onToggle(data.id)}
              className="mt-1 mr-3"
            />
          )}

          {/* Image + Text */}
          <div className="flex items-start gap-3 min-w-0">
            {/* Image */}

            {/* Text */}
            <div className="flex flex-col min-w-0">
              <div
                className="font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
                title={data.student.name}
              >
                {data.student.name}
              </div>

              <p className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                {" "}
                Kelas : {data.student.class?.name || "Tidak Ada Kelas"}
              </p>
              <div className="text-sm text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                Status :
                {lewat ? (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
              ${paymentStatus === "OVERDUE" ? "bg-red-100 text-red-800" : ""}
             
            `}
                  >
                    {paymentStatus === "OVERDUE" && "Terlambat"}
                  </span>
                ) : (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
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
                    {data.status === "PENDING" && "Belum Dibayar"}
                    {data.status === "PAID" && "Lunas"}
                    {data.status === "OVERDUE" && "Terlambat"}
                    {data.status === "PARTIALLY_PAID" && "Dibayar Sebagian"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="text-indigo-600 text-sm"
        >
          {open ? "Sembunyikan" : "Detail"}
        </button>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t space-y-3 text-sm text-gray-700 ml-3">
          <div className="space-y-1">
            <PaymentInstallmentsPreview
              installments={data.paymentInstallments}
              totalAmount={Number(data.amount)}
              limit={1}
            />
            {allowedStaff && (
              <div className="font-medium py-3">
                <FormModal
                  type="create"
                  table="payment"
                  id={data.id}
                  data={data}
                  relatedData={relatedData}
                  onChanged={onChanged}
                />
                <span>Tambah</span>
                <FormModal
                  type="update"
                  table="payment"
                  id={data.id}
                  data={data}
                  relatedData={relatedData}
                  onChanged={onChanged}
                />
                <span>Ubah</span>
              </div>
            )}
            <div className="font-medium">
              Jatuh Tempo:{" "}
              <span className="font-normal">
                {data.dueDate.toLocaleDateString("en-UK", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {allowedStaff && (
            <div className="flex items-center gap-3 mt-4">
              {/* Update */}
              <div className="flex items-center gap-2">
                <FormModal
                  table="bill"
                  type="update"
                  data={data}
                  relatedData={relatedData}
                  onChanged={onChanged}
                />
                <span className="text-sm text-blue-600 font-medium cursor-pointer select-none">
                  Ubah
                </span>
              </div>

              {/* Delete */}
              <div className="flex items-center gap-2">
                <FormModal
                  table="bill"
                  type="delete"
                  id={data.id}
                  onDeleted={() => onDeleted?.([data.id])}
                />
                <span className="text-sm text-red-600 font-medium cursor-pointer select-none">
                  Hapus
                </span>
              </div>
              {data.status === "PAID" && (
                <button
                  onClick={() => onDownload?.(data.id)}
                  className="w-7 h-7 text-sm text-white underline bg-lamaGreen flex items-center justify-center rounded-full transition hover:brightness-90 shadow-md"
                >
                  <FaFileDownload height={16} width={15} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
