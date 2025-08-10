"use client"
import { useState } from "react";
import Image from "next/image";

export default function EmailCopy({ email }: { email: string | null }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // reset after 1.5s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2 relative">
      <Image src="/mail.png" alt="mail" width={14} height={14} />
      <span
        className="truncate max-w-full overflow-hidden text-ellipsis cursor-pointer hover:underline"
        onClick={handleCopy}
        title="Click to copy"
      >
        {email || "-"}
      </span>

      {/* Copied Tooltip */}
      {copied && (
        <div className="absolute top-full left-0 mt-1 px-2 py-1 rounded bg-green-600 text-white text-xs shadow-lg animate-fade-in">
          ✅ Copied!
        </div>
      )}
    </div>
  );
}

