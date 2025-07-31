"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

const defaultSortOptions = [
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
  { label: "ID Asc", value: "id_asc" },
  { label: "ID Desc", value: "id_desc" },
];

const FilterSortBar = ({
  filterFields,
  sortOptions = defaultSortOptions,
  className = "",
}: {
  filterFields: {
    label: string;
    name: string;
    options: { label: string; value: string | number }[];
  }[];
  sortOptions?: { label: string; value: string }[];
  className?: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(() => {
    const initial: Record<string, string | number> = {};
    filterFields.forEach((f) => {
      const value = searchParams.get(f.name);
      if (value) initial[f.name] = value;
    });
    return initial;
  });

  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [limit, setLimit] = useState(searchParams.get("limit") || "10");

  const updateQuery = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value.toString());

    // Reset to page 1 if limit or filter/sort changes
    if (["limit", "sort", ...filterFields.map((f) => f.name)].includes(key)) {
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden ${className}`}
    >
      <div className="flex flex-wrap gap-2 items-center mb-4">
        {filterFields.map((field) => (
          <select
            key={field.name}
            className="border px-2 py-1 rounded-md text-sm"
            value={filters[field.name]?.toString() || ""}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                [field.name]: e.target.value,
              }));
              updateQuery(field.name, e.target.value);
            }}
          >
            <option value="">Filter by {field.label}</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {sortOptions.length > 0 && (
          <select
            className="border px-2 py-1 rounded-md text-sm"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              updateQuery("sort", e.target.value);
            }}
          >
            <option value="">Sort by</option>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Items Per Page Selector */}
        <select
          className="border px-2 py-1 rounded-md text-sm"
          value={limit}
          onChange={(e) => {
            setLimit(e.target.value);
            updateQuery("limit", e.target.value);
          }}
        >
          <option value="10">Show 10</option>
          <option value="20">Show 20</option>
          <option value="30">Show 30</option>
          <option value="all">Show All</option>
        </select>
      </div>
    </div>
  );
};

export default FilterSortBar;
