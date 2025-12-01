"use client";
import { useState } from "react";

export default function TeacherListPopover({
  label,
  items,
}: {
  label: "Mata Pelajaran" | "Kelas";
  items: { name: string }[];
}) {
  const [open, setOpen] = useState(false);

  if (!items || items.length === 0) return <span>-</span>;

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="text-blue-600 underline text-xs"
      >
        {items.length} {label}
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-md p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-3 capitalize">{label}</h2>

            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="border-b py-2 text-sm font-medium">
                  {item.name}
                </li>
              ))}
            </ul>

            <button
              className="mt-3 text-sm text-blue-600 underline"
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
