"use client";

import Link from "next/link";
import React from "react";

export default function PromotionBanner({
  open,
  reason,
  startDate,
  endDate,
  quota,
  usedQuota,
}: {
  open: boolean;
  reason: string;
  startDate?: string;
  endDate?: string;
  quota?: number;
  usedQuota?: number;
}) {
  const format = (date: string | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  let message: React.ReactNode = null;

  if (open) {
    message = (
      <>
        <span className="text-yellow-300 font-semibold">PPDB Dibuka!</span>{" "}
        Daftar sekarang periode{" "}
        <span className="font-semibold">{format(startDate)}</span> sampai{" "}
        <span className="font-semibold">{format(endDate)}</span> —
        <span className="text-yellow-300 font-semibold">
          {" "}
          Sisa kuota: {quota! - usedQuota!}
        </span>
      </>
    );
  } else if (reason === "NOT_STARTED") {
    message = (
      <>
        Maaf, PPDB belum dibuka (dibuka{" "}
        <span className="font-semibold">{format(startDate)}</span>)
      </>
    );
  } else if (reason === "ENDED") {
    message = (
      <>
        Maaf, PPDB sudah ditutup pada{" "}
        <span className="font-semibold">{format(endDate)}</span>
      </>
    );
  } else if (reason === "QUOTA_FULL") {
    message = "Maaf, kuota PPDB sudah penuh";
  } else {
    message = "PPDB tidak tersedia saat ini.";
  }
  return (
    <div
      className="
      px-6 py-3 
      bg-white/10 backdrop-blur-md 
      rounded-xl shadow-lg 
      border-l-4 border-yellow-400
      text-white text-sm md:text-base font-medium
      max-w-4xl mx-auto 
      mt-40
    "
    >
      <Link href="/daftar">{message}</Link>
    </div>
  );
}
