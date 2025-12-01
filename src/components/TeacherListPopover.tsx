"use client";
import { useState } from "react";

export default function TeacherListPopover({
  label,
  items,
}: {
  label: "Mata Pelajaran" | "Kelas" | "Jadwal";
  items: { name: string }[];
}) {
  const [open, setOpen] = useState(false);

  if (!items || items.length === 0) return <span>-</span>;
  function toNormalCase(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
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

            {label === "Jadwal" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100 font-medium">
                    <tr>
                      <th className="border px-2 py-1 text-left">Hari</th>
                      <th className="border px-2 py-1 text-left">Mulai</th>
                      <th className="border px-2 py-1 text-left">Selesai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((lesson: any, i) => (
                      <tr key={i} className="border">
                        <td className="border px-2 py-1">
                          {toNormalCase(lesson.day)}
                        </td>
                        <td className="border px-2 py-1">
                          {new Date(lesson.startTime).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                        <td className="border px-2 py-1">
                          {new Date(lesson.endTime).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Normal list if NOT "Jadwal"
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="border-b py-2 text-sm font-medium">
                    {item.name}
                  </li>
                ))}
              </ul>
            )}

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
