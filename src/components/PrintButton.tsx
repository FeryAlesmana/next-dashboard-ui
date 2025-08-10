"use client";

export default function PrintButton() {
  return (
    <div className="mt-6 print:hidden text-right">
      <button
        onClick={() => window.print()}
        className="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-lamaPurple"
      >
        🖨️
      </button>
    </div>
  );
}
