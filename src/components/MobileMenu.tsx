import { useEffect, useRef } from "react";
import FormModal from "./FormModal";
import PaymentInstallmentsPreview from "./PaymentInstallmentsPreview";
import { TableName } from "./FormContainer";
import Link from "next/link";
import Image from "next/image";

export default function MobileMenu({
  table,
  onClose,
  data,
  role,
  relatedData,
  onChanged,
  onDeleted,
}: {
  table: TableName;
  data: any;
  role: string;
  relatedData: any;
  onDeleted?: ((ids: (string | number)[]) => void) | undefined;
  onChanged?: ((item: any) => void) | undefined;
  onClose?: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Close when click outside
  useEffect(() => {
    function handleClickOutside(e: any) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);
  // 🔥 SWITCH CASE rendering
  function renderMenuContent() {
    switch (table) {
      case "lesson":
        return (
          <Link
            href={`/list/attendance/${data.class.name}/${data.id}`}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded"
            onClick={() => onClose?.()}
          >
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky shadow-lg">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
            Lihat Absensi
          </Link>
        );

      case "paymentLog":
        return (
          <div className="hover:bg-gray-100 active:bg-gray-200 cursor-pointer p-3">
            <PaymentInstallmentsPreview
              installments={data.paymentInstallments}
              totalAmount={Number(data.amount)}
              limit={1}
            />
          </div>
        );

      case "student":
        return (
          <div className="px-3 py-2 text-sm text-gray-600">
            No actions for student yet.
          </div>
        );

      default:
        return (
          <div className="px-3 py-2 text-sm text-gray-400">
            No menu items available.
          </div>
        );
    }
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-md z-20
                 flex flex-col overflow-hidden animate-in fade-in duration-150"
    >
      {/* HEADER */}
      <div className="px-3 py-2 text-xs font-semibold bg-gray-50 border-b text-gray-600">
        Menu
      </div>

      {/* SWITCH OUTPUT */}
      {renderMenuContent()}

      {role === "admin" && (
        <>
          {/* Update */}
          <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 active:bg-gray-200 cursor-pointer">
            <FormModal
              table={table}
              type="update"
              data={data}
              relatedData={relatedData}
              onChanged={onChanged}
            />
            <span className="text-sm text-gray-700">Edit</span>
          </div>

          {/* Delete */}
          <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 active:bg-gray-200 cursor-pointer">
            <FormModal
              table={table}
              type="delete"
              id={data.id}
              onDeleted={() => onDeleted?.([data.id])}
            />
            <span className="text-sm text-red-600">Hapus</span>
          </div>
        </>
      )}
    </div>
  );
}
