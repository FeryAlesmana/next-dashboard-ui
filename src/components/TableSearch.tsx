"use client";

import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const TableSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize value from query param
  const [value, setValue] = useState("");

  useEffect(() => {
    const current = searchParams.get("search") || "";
    setValue(current);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params}`);
  };

  const handleClear = () => {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`${pathname}?${params}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2 w-full md:w-auto"
    >
      <Image src="/search.png" alt="Search" width={14} height={14} />
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 md:w-[200px] p-2 bg-transparent outline-none min-w-0"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </form>
  );
};

export default TableSearch;
