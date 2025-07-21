import React from "react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4 "></div>
        <span className="text-lg font-semibold text-blue-600">Memuat halaman...</span>
      </div>
    </div>
  );
}
