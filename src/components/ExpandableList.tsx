"use client";
import { useState } from "react";

export default function ExpandableList({
  items,
  limit = 1, // how many to show before collapsing
  separator = ", ", // separator between names
}: {
  items: string[];
  limit?: number;
  separator?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!items || items.length === 0) return <span>-</span>;

  // If items are few → no need to collapse
  if (items.length <= limit) {
    return <span>{items.join(separator)}</span>;
  }

  const visible = items.slice(0, limit).join(separator);
  const hiddenCount = items.length - limit;

  return (
    <div className="inline">
      {expanded ? (
        <>
          {items.join(separator)}
          <button
            className="text-blue-500 text-xs ml-1"
            onClick={() => setExpanded(false)}
          >
            show less
          </button>
        </>
      ) : (
        <>
          {visible}
          <button
            className="text-blue-500 text-xs ml-1"
            onClick={() => setExpanded(true)}
          >
            +{hiddenCount} more
          </button>
        </>
      )}
    </div>
  );
}
