"use client";

import ParentTableSkeleton from "@/components/StudentParentTableSkeleton";

export default function SandboxPage() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">Skeleton Preview</h2>
      <ParentTableSkeleton />
    </div>
  );
}
