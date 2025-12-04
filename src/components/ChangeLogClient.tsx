"use client";

import { useState } from "react";
import TableSearch from "./TableSearch";
import FilterSortToggle from "./FilterSortToggle";
import { toast } from "react-toastify";
import Link from "next/link";

export default function ChangeLogClient({
  groups,
  options,
  hasMore,
}: {
  groups: any[];
  options: any;
  hasMore: any;
}) {
  const [items, setItems] = useState(groups);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);

    const res = await fetch(`/api/payment-changelog?page=${page + 1}`, {
      cache: "no-store",
    });

    const json = await res.json();

    setItems((prev) => [...prev, ...json.groups]);
    setPage((p) => p + 1);
    setLoading(false);
  }

  const { roleOptions = [], actOptions = [] } = options || [];
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="space-y-4 mt-3">
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            ChangeLog Pembayaran
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <FilterSortToggle
                filterFields={[
                  { name: "byRole", label: "Role", options: roleOptions },
                  { name: "action", label: "Aksi", options: actOptions },
                ]}
                sortOptions={[
                  { label: "Terbaru", value: "newest" },
                  { label: "Paling Lama", value: "oldest" },
                  { label: "ID Asc", value: "id_asc" },
                  { label: "ID Desc", value: "id_desc" },
                ]}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          {!groups || groups.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <h2 className="text-lg font-semibold">
                Tidak ada perubahan record untuk sekarang.
              </h2>
              <p className="text-sm mt-1">
                Perubahan akan tampil jika user mengedit paymentLog.
              </p>
            </div>
          ) : (
            items.map((group: any, idx: number) => (
              <ChangeGroup key={idx} group={group} />
            ))
          )}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              disabled={loading}
              onClick={loadMore}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const ChangeGroup = ({ group }: { group: any }) => {
  const [open, setOpen] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(false);

  async function revertGroup() {
    if (!confirm("Kembalikan SEMUA Perubahan-perubahan di group Ini?")) return;

    setLoadingGroup(true);

    const res = await fetch(`/api/payment-revert/group`, {
      method: "POST",
      body: JSON.stringify({
        ids: group.items.map((item: any) => item.id),
      }),
    });

    setLoadingGroup(false);

    const data = await res.json();

    if (res.ok) {
      const revertedCount = data?.results?.length || 0;

      toast.success(` ${revertedCount} Perubahan berhasil di kembalikan`);

      setTimeout(() => window.location.reload(), 800);
    } else {
      toast.error("Gagal mengembalikan Perubahan-perubahan");
    }
  }

  return (
    <div className="bg-lamaPurple rounded-lg shadow p-4 mt-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg">
            <span className="hidden md:inline">Username : </span>
            {group.user}
          </p>
          <p className="text-sm text-gray-500">
            Role: {group.role} | {group.date}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm disabled:opacity-50"
            disabled={loadingGroup}
            onClick={revertGroup}
          >
            {loadingGroup ? "Reverting..." : "Revert Group"}
          </button>

          <button
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
            onClick={() => setOpen(!open)}
          >
            {open ? "Collapse" : `Expand (${group.items.length} changes)`}
          </button>
        </div>
      </div>

      {/* LIST */}
      {open && (
        <div className="mt-4 flex flex-col gap-3">
          {group.items.map((item: any, idx: number) => (
            <ChangeItem key={item.id} item={item} index={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

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
      window.location.reload();
    } else {
      toast("Gagal di kembalikan");
    }
  }

  return (
    <div className="border rounded p-3 bg-gray-50">
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
        <button
          disabled={loading}
          onClick={revertChange}
          className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
        >
          {loading ? "Reverting..." : "Revert"}
        </button>
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
                  <pre className="text-xs line-through opacity-70">
                    - {JSON.stringify(oldV)}
                  </pre>
                )}

                {/* New value */}
                {newV !== undefined && (
                  <pre className="text-xs">+ {JSON.stringify(newV)}</pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
