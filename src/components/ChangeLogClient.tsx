"use client";

import { useState } from "react";
import TableSearch from "./TableSearch";
import FilterSortToggle from "./FilterSortToggle";

export default function ChangeLogClient({
  groups,
  options,
}: {
  groups: any[];
  options: any;
}) {
  function computeDiff(oldVal: any, newVal: any) {
    const result = [];

    const allKeys = new Set([
      ...Object.keys(oldVal || {}),
      ...Object.keys(newVal || {}),
    ]);

    for (const key of allKeys) {
      if (oldVal?.[key] !== newVal?.[key]) {
        result.push({
          field: key,
          oldValue: oldVal ? oldVal[key] : null,
          newValue: newVal ? newVal[key] : null,
        });
      }
    }

    return result;
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <h2 className="text-lg font-semibold">No changes recorded yet.</h2>
        <p className="text-sm mt-1">
          Changes will appear here whenever users update the payment logs.
        </p>
      </div>
    );
  }
  const { roleOptions = [], actOptions = [] } = options || [];
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="space-y-4 mt-3">
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Payment ChangeLog
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
          {groups.map((group: any, idx) => (
            <ChangeGroup key={idx} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}

const ChangeGroup = ({ group }: { group: any }) => {
  const [open, setOpen] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(false);

  async function revertGroup() {
    if (!confirm("Revert ALL changes in this group?")) return;

    setLoadingGroup(true);

    const res = await fetch(`/api/payment-revert/group`, {
      method: "POST",
      body: JSON.stringify({
        ids: group.items.map((item: any) => item.id),
      }),
    });

    setLoadingGroup(false);

    if (res.ok) {
      alert("Group reverted successfully");
      window.location.reload();
    } else {
      alert("Failed to revert group");
    }
  }

  return (
    <div className="bg-lamaPurple rounded-lg shadow p-4 mt-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg">{group.user}</p>
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
          {group.items.map((item: any) => (
            <ChangeItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

const ChangeItem = ({ item }: { item: any }) => {
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
      alert("Reverted successfully");
      window.location.reload();
    } else {
      alert("Failed to revert");
    }
  }

  return (
    <div className="border rounded p-3 bg-gray-50">
      <div className="flex justify-between ">
        <div>
          <p className="font-semibold">{item.action}</p>
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
