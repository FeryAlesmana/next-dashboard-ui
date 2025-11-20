"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function NameListPopover({
  items,
  label = "items",
}: {
  items: any[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const getSubInfo = (item: any) => {
    switch (label?.toLowerCase()) {
      case "murid":
        return item.className || item.class?.name || "-";
      case "guru":
        return item.email || "-";
      case "orang tua":
      case "parent":
        return item.phone || "-";
      default:
        return ""; // Nothing extra displayed
    }
  };
  if (!items || items.length === 0) return <span>-</span>;
  const profileBase =
    label?.toLowerCase() === "murid"
      ? "/list/students"
      : label?.toLowerCase() === "guru"
      ? "/list/teachers"
      : null;

  return (
    <>
      {/* Trigger button inside table cell */}
      <button
        onClick={() => setOpen(true)}
        className="text-blue-600 underline text-xs"
      >
        {items.length} {label}
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-md p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2 capitalize">{label}</h2>

            <ul className="space-y-2">
              {items.map((item, i) => {
                const profileHref =
                  profileBase && item.id ? `${profileBase}/${item.id}` : null;

                return (
                  <li
                    key={i}
                    className="flex items-center justify-between border-b py-2"
                  >
                    {/* LEFT: avatar + info */}
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.img || "/noAvatar.png"}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />

                      <div>
                        <p className="font-semibold text-sm max-w-[180px] truncate">
                          {item.name}
                        </p>

                        {getSubInfo(item) && (
                          <p className="text-xs text-gray-500">
                            {getSubInfo(item)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* RIGHT: profile button */}
                    {profileHref ? (
                      <Link href={profileHref}>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky shadow hover:bg-lamaSky/80"
                          title="View Profile"
                        >
                          <Image
                            src="/view.png"
                            alt=""
                            width={16}
                            height={16}
                          />
                        </button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full cursor-not-allowed"
                        title="Unavailable"
                      >
                        <Image
                          src="/view.png"
                          alt=""
                          width={16}
                          height={16}
                          className="opacity-50"
                        />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <button
              className="mt-3 text-sm text-blue-600 underline"
              onClick={() => setOpen(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
