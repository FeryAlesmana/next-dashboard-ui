"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import Select from "react-select";

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
    boptions?: { label: string; value: boolean | undefined }[];
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
      <div className="flex flex-col lg:flex-row flex-wrap gap-2 items-start lg:items-center justify-start mb-4">
        {filterFields.map((field) => {
          const selectedValue = filters[field.name]?.toString() || "";
          return (
            <div key={field.name} className="w-min-[200px]">
              <Select
                instanceId={field.name}
                placeholder={`Filter by ${field.label}`}
                options={field.options.map((opt) => ({
                  label: opt.label,
                  value: opt.value.toString(),
                }))}
                value={
                  selectedValue
                    ? {
                        label:
                          field.options.find(
                            (opt) => opt.value.toString() === selectedValue
                          )?.label || "",
                        value: selectedValue,
                      }
                    : null
                }
                onChange={(selected) => {
                  const value = selected ? selected.value : "";
                  setFilters((prev) => ({
                    ...prev,
                    [field.name]: value,
                  }));
                  updateQuery(field.name, value);
                }}
                isClearable
                menuPortalTarget={document.body} // render outside overflow-hidden parents
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "32px", // match small select height
                    height: "32px",
                    fontSize: "0.875rem", // text-sm
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    height: "32px",
                    padding: "0 8px",
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: "32px",
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999, // make dropdown appear above everything
                  }),
                }}
              />
            </div>
          );
        })}

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
