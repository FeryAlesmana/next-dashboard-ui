"use client";
import { useState } from "react";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";
import { ChangeAction } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import ChangeItemPopover from "../ChangeItemPopOver";

export function MobilePaymentChangeCard({
  data,
  selected,
  onToggle,
  relatedData,
  onChanged,
  onDeleted,
  role,
  allowedStaff,
  onToggleRow,
  onClose,
  openRow,
}: BaseTableClientProps & {
  onToggleRow: (id: number) => void;
  onClose: () => void;
  openRow: number | null;
}) {
  const [open, setOpen] = useState(false);

  function translateStaffRole(role: string): string {
    switch (role) {
      case "PENILAIAN":
        return "Penilaian & Kesiswaan";
      case "PENJADWALAN":
        return "Penjadwalan";
      case "ACCOUNTING":
        return "Akuntansi";
      default:
        return role;
    }
  }
  function translateChangeAction(action?: ChangeAction) {
    switch (action) {
      case "CREATE_BILL":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Buat Tagihan
          </span>
        );

      case "CREATE_PAYMENTS":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            Tambah Pembayaran
          </span>
        );
      case "UPDATE_PAYMENTS":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
            Edit Pembayaran
          </span>
        );

      case "UPDATE_BILL":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Edit Tagihan
          </span>
        );

      case "DELETE_BILL":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Hapus Tagihan
          </span>
        );

      case "DELETE_PAYMENTS":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
            Hapus Pembayaran
          </span>
        );

      case "REVERT":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Revert
          </span>
        );

      case "UNREVERT":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            -
          </span>
        );

      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            -
          </span>
        );
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between min-w-0">
        {/* LEFT SIDE: Checkbox + Image + Text */}
        <div className="flex items-start">
          {/* Checkbox */}

          {/* Image + Text */}
          <div className="flex items-start gap-3 min-w-0">
            {/* Image */}

            {/* Text */}
            <div className="flex flex-col min-w-0">
              <div
                className="font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
                title={data.changedByName}
              >
                {data.changedByName}
              </div>

              <p className="text-xs text-gray-500">
                {translateStaffRole(data.changedByRole)}
              </p>
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
            <div className="font-medium flex min-w-0">
              <span className="shrink-0"> Jenis Aksi :</span>
              <span className="font-normal overflow-hidden text-ellipsis whitespace-nowrap ml-1 min-w-0">
                {translateChangeAction(data.action)}
              </span>
            </div>
            <div className="font-medium flex min-w-0">
              <span className="shrink-0"> Di ubah Pada :</span>
              <span className="font-normal overflow-hidden text-ellipsis whitespace-nowrap ml-1 min-w-0">
                {new Date(data.createdAt).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="font-medium">
              Detail :{" "}
              <button
                className="w-5 h-5 rounded-full ml-3 "
                onClick={() => onToggleRow(data.id)}
              >
                <Image src="/view.png" alt="" width={16} height={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      {openRow === data.id && (
        <ChangeItemPopover item={data} index={1} onClose={onClose} />
      )}
    </div>
  );
}
