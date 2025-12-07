import { useState, useEffect, useRef } from "react";

export function RupiahInput({ value, onChange }: any) {
  const [display, setDisplay] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Format numeric → rupiah when value changes from outside
  useEffect(() => {
    if (value === null || value === undefined || value === "") {
      setDisplay("");
      return;
    }

    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

    setDisplay(formatted);
  }, [value]);

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const handleInput = (e: any) => {
    const rawText = e.target.value;

    // Extract ONLY digits
    const digits = rawText.replace(/[^\d]/g, "");

    // If empty → clear
    if (digits === "") {
      setDisplay("");
      onChange(null);
      return;
    }

    const numeric = Number(digits);

    // Update parent with number value
    onChange(numeric);

    // Update our display
    setDisplay(formatRupiah(numeric));
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={display}
      onChange={handleInput}
      className="border rounded p-2 w-full font-medium"
      placeholder="Rp 0"
    />
  );
}
