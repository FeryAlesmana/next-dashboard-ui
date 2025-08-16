"use client";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { toast } from "react-toastify";

// DeleteManyForm.tsx
type DeleteManyFormProps = {
  ids: string[];
  formAction: (formData: FormData) => void;
  table: string;
  onDeleted?: (ids: (string | number)[]) => void;
};

export default function DeleteManyForm({
  ids,
  formAction,
  table,
  onDeleted,
}: DeleteManyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("table", table);
    ids.forEach((id) => formData.append("ids", String(id)));
    startTransition(() => {
      formAction(formData);
    });
  };

  useEffect(() => {
    if (!isSubmitting) return;
    // you can watch state from props if you pass it down
    toast(`${ids.length} data dari ${table} berhasil dihapus`);
    if (onDeleted) {
      if (!ids || ids.length === 0) {
        onDeleted(ids);
      } else {
        router.refresh();
      }
    }
    router.refresh();
    setIsSubmitting(false);
  }, [isSubmitting, ids, table, router, onDeleted]);
  if (!ids || ids.length === 0) {
    return <span>Tidak ada data yang dipilih.</span>;
  }

  return (
    <form onSubmit={handleSubmit} className="p4 flex flex-col gap-4">
      <input type="hidden" name="table" value={table} />
      {ids.map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}
      <span className="text-center font-medium">
        {ids.length} data akan terhapus. Apakah anda yakin?
      </span>
      <div className="flex justify-center gap-4">
        <button
          type="submit"
          className="bg-red-600 w-1/4 text-white font-semibold px-6 py-3 rounded hover:bg-gray-700 flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-blue-400 rounded-full mr-2"></span>
          )}
          {isSubmitting ? "Memproses..." : "Hapus Banyak"}
        </button>
      </div>
    </form>
  );
}
