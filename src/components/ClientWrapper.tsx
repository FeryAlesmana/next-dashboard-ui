"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function ClientPageWrapper({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string;
}) {
  const searchParams = useSearchParams();
  const [key, setKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  useEffect(() => {
    const current = searchParams.toString();

    if (key === null) {
      // First render
      setKey(current);
      setLoading(false);
    } else if (current !== key) {
      // Query param changed
      setLoading(true);
      setKey(current);

      const timeout = setTimeout(() => {
        setLoading(false);
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [searchParams, key]);

  if (loading || key === null) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 animate-pulse">
        {/* Your skeleton loading UI */}
        <div className="flex items-center justify-between">
          <div className="hidden md:block w-1/4 h-6 bg-gray-300 rounded"></div>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="w-full md:w-48 h-8 bg-gray-300 rounded"></div>
            <div className="flex items-center gap-4 self-end">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              {role === "admin" && (
                <div className="w-24 h-8 bg-gray-300 rounded"></div>
              )}
            </div>
          </div>
        </div>

        {/* LIST Skeleton Table */}
        <div className="mt-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="grid grid-cols-6 gap-4 items-center p-4 border-b border-gray-200"
              >
                <div className="col-span-1 h-4 bg-gray-300 rounded"></div>
                <div className="col-span-1 h-4 bg-gray-300 rounded"></div>
                <div className="col-span-1 h-4 bg-gray-300 rounded hidden md:block"></div>
                <div className="col-span-1 h-4 bg-gray-300 rounded hidden md:block"></div>
                <div className="col-span-1 h-4 bg-gray-300 rounded hidden md:block"></div>
                <div className="col-span-1 flex gap-2">
                  {role === "admin" && (
                    <div>
                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAGINATION Skeleton */}
        <div className="flex justify-between mt-6">
          <div className="w-15 h-8 bg-gray-300 rounded "></div>
          <div className="w-6 h-8 bg-gray-300 rounded "></div>
          <div className="w-15 h-8 bg-gray-300 rounded "></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
