"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import FilterSortBar from "./FilterSortBar";

type FilterField = {
  label: string;
  name: string;
  options: { label: string; value: string | number }[];
  boptions?: { label: string; value: boolean | undefined }[];
};

interface FilterSortToggleProps {
  filterFields: FilterField[];
  iconSrc?: string;
  className?: string;
  sortOptions?: { label: string; value: string }[];
}

export default function FilterSortToggle({
  filterFields,
  iconSrc = "/filter.png",
  className = "",
  sortOptions,
}: FilterSortToggleProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="flex justify-end">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
        >
          <Image src={iconSrc} alt="Filter" width={14} height={14} />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-max z-50 bg-white rounded-lg shadow-lg p-4 ">
          <FilterSortBar
            filterFields={filterFields}
            sortOptions={sortOptions}
          />
        </div>
      )}
    </div>
  );
}
