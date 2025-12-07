"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";

export default function InstallmentPopover({
  relatedInstallments,
  onDeleted,
}: {
  relatedInstallments: {
    id: number;
    amount: number;
    paidAt: string | null;
  }[];
  onDeleted: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id: number) => {
    try {
      setLoadingId(id);

      const res = await fetch(`/api/installments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus");

      toast.success("Berhasil menghapus cicilan");
      onDeleted(id);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus cicilan");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger button */}
      <button
        type="button"
        className="px-3 py-1 border rounded-md text-sm bg-white hover:bg-gray-100"
        onClick={() => setOpen((prev) => !prev)}
      >
        Lihat Cicilan ({relatedInstallments.length})
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute z-50 mt-2 w-80 bg-white border shadow-md rounded-md p-4">
          <h4 className="font-semibold mb-3">Daftar Cicilan</h4>

          {relatedInstallments.length === 0 ? (
            <p className="text-sm text-gray-500">Tidak ada cicilan.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {relatedInstallments.map((inst, idx) => (
                <div
                  key={inst.id}
                  className="flex items-center justify-between border p-2 rounded"
                >
                  <div>
                    <p className="text-sm font-medium">
                      #{idx + 1} — Rp {inst.amount.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {inst.paidAt
                        ? new Date(inst.paidAt).toLocaleDateString("id-ID")
                        : "Tidak ada tanggal"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="p-2 rounded hover:bg-red-100"
                    onClick={() => handleDelete(inst.id)}
                    disabled={loadingId === inst.id}
                  >
                    {/* Trash icon (SVG) */}
                    <Image
                      src="/deleteDark.png"
                      alt="Hapus"
                      width={16}
                      height={16}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
