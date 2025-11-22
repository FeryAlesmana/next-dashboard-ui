"use client";

const DEFAULT_LIMIT = 10;
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Pagination = ({ page, count }: { page: number; count: number }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const limit = parseInt(searchParams.get("limit") || DEFAULT_LIMIT.toString());

  const totalPages = Math.ceil(count / limit);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  const [maxVisible, setMaxVisible] = useState(4);

  useEffect(() => {
    const checkSize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMaxVisible(10); // lg and above
      } else {
        setMaxVisible(4); // mobile/tablet
      }
    };

    checkSize(); // run once
    window.addEventListener("resize", checkSize);

    return () => window.removeEventListener("resize", checkSize);
  }, []);
  // ---- Pagination Range Logic ----
  const getPages = () => {
    if (totalPages <= maxVisible) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }

    // MOBILE behavior (maxVisible = 4)
    if (maxVisible === 4) {
      if (page <= 3) return [1, 2, 3, "...", totalPages];
      if (page >= totalPages - 2)
        return [1, "...", totalPages - 2, totalPages - 1, totalPages];
      return [1, "...", page - 1, page, page + 1, "...", totalPages];
    }

    // DESKTOP behavior (maxVisible = 10)
    const sideCount = 3; // numbers near start/end

    if (page <= sideCount + 1) {
      return [
        ...Array(sideCount + 2)
          .fill(0)
          .map((_, i) => i + 1),
        "...",
        totalPages,
      ];
    }

    if (page >= totalPages - sideCount) {
      return [
        1,
        "...",
        ...Array(sideCount + 2)
          .fill(0)
          .map((_, i) => totalPages - (sideCount + 1) + i),
      ];
    }

    return [
      1,
      "...",
      page - 2,
      page - 1,
      page,
      page + 1,
      page + 2,
      "...",
      totalPages,
    ];
  };
  const pages = getPages();
  return (
    <div className="p-4 flex items-center justify-between to-gray-500">
      <button
        disabled={!hasPrev}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {
          changePage(page - 1);
        }}
      >
        Prev
      </button>
      {/* PAGE NUMBERS */}
      <div className="flex items-center justify-between text-sm">
        {pages.map((p, i: number) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2">
              ...
            </span>
          ) : (
            <button
              key={`page-${p}`}
              className={`px-2 rounded-md ${page === p ? "bg-lamaBlue" : ""}`}
              onClick={() => changePage(Number(p))}
            >
              {p}
            </button>
          )
        )}
      </div>
      <button
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!hasNext}
        onClick={() => {
          changePage(page + 1);
        }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
