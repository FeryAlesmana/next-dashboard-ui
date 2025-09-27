"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const TableSearch = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = (e.currentTarget[0] as HTMLInputElement).value;
    const params = new URLSearchParams(window.location.search);
    params.set("search", value);
    router.push(`${window.location.pathname}?${params}`);
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
        className="flex-1 md:w-[200px] p-2 bg-transparent outline-none min-w-0"
      />
    </form>
  );
};

export default TableSearch;
