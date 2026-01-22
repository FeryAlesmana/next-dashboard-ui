"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";

export default function ChangeItemPopover({
  item,
  index,
  onClose,
}: {
  item: any;
  index: number;
  onClose: () => void;
}) {
  const router = useRouter();
  if (typeof window === "undefined") return null;
  const ChangeItem = ({ item, index }: { item: any; index: number }) => {
    const [loading, setLoading] = useState(false);

    const oldVal = item.oldValue || {};
    const newVal = item.newValue || {};

    // Fields that actually changed
    const changedKeys = Object.keys({
      ...oldVal,
      ...newVal,
    }).filter((key) => oldVal[key] !== newVal[key]);

    async function revertChange() {
      setLoading(true);

      const res = await fetch(`/api/payment-revert/${item.id}`, {
        method: "POST",
      });

      setLoading(false);

      if (res.ok) {
        toast("Berhasil di kembalikan");
        router.refresh();
      } else {
        toast("Gagal di kembalikan");
      }
    }

    return (
      <div className="border rounded p-3 bg-gray-50 pt-4">
        <div className="flex justify-between ">
          <div>
            <p className="font-semibold">
              {index}. {item.action}
              {/* SHOW LINK ONLY IF UPDATE */}
              {item.action === "UPDATE" && item.paymentLogId && (
                <Link
                  href={`/list/payment/?id=${item.paymentLogId}`}
                  className="ml-2 text-blue-600 underline text-xs"
                >
                  Lihat Record
                </Link>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleString("id-ID")}
            </p>
          </div>
          {item.revertedFromId === null && (
            <button
              disabled={loading}
              onClick={revertChange}
              className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
            >
              {loading ? "Reverting..." : "Revert"}
            </button>
          )}
        </div>

        {/* DIFF BLOCK */}
        <div className="mt-3 space-y-2 text-sm bg-gray-500 p-2 rounded-md">
          {changedKeys.length === 0 ? (
            <p className="text-xs text-gray-500 italic">
              No changes recorded for this entry.
            </p>
          ) : (
            changedKeys.map((key) => {
              const oldV = oldVal[key];
              const newV = newVal[key];

              // Determine diff style
              let color = "text-yellow-700 bg-yellow-50 border-yellow-200"; // modified
              if (oldV === undefined)
                color = "text-green-700 bg-green-50 border-green-200"; // added
              if (newV === undefined)
                color = "text-red-700 bg-red-50 border-red-200"; // removed

              return (
                <div key={key} className={`border p-2 rounded ${color}`}>
                  <p className="font-medium text-xs">{key}</p>

                  {/* Old value */}
                  {oldV !== undefined && (
                    <pre className="text-xs line-through opacity-70 whitespace-pre-wrap break-all overflow-x-auto max-w-full">
                      - {JSON.stringify(oldV, null, 2)}
                    </pre>
                  )}

                  {/* New value */}
                  {newV !== undefined && (
                    <pre className="text-xs whitespace-pre-wrap break-all overflow-x-auto max-w-full">
                      + {JSON.stringify(newV, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-[4999]" onClick={onClose} />

      {/* Popover panel */}
      <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-lg bg-white shadow-xl border p-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 cursor-pointer"
          >
            <Image src="/close.png" width={14} height={14} alt="" />
          </button>
          <div className="pt-5">
            <ChangeItem item={item} index={index} />
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
