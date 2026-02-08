"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FaBuilding,
  FaChalkboardTeacher,
  FaShieldAlt,
  FaFutbol,
  FaUtensils,
  FaStore,
  FaMosque,
  FaLaptop,
} from "react-icons/fa";
import Link from "next/link";

export const FACILITY_ICON_MAP = {
  chalkboard: FaChalkboardTeacher,
  building: FaBuilding,
  sport: FaFutbol,
  mosque: FaMosque,
  utensils: FaUtensils,
  store: FaStore,
  shield: FaShieldAlt,
  laptop: FaLaptop,
} as const;

export type FacilityIconKey = keyof typeof FACILITY_ICON_MAP;

/* ---------------- ICON REGISTRY ---------------- */

const ICONS = {
  chalkboard: FaChalkboardTeacher,
  building: FaBuilding,
  sport: FaFutbol,
  mosque: FaMosque,
  utensils: FaUtensils,
  store: FaStore,
  shield: FaShieldAlt,
  laptop: FaLaptop,
};

/* ---------------- FALLBACK DATA ---------------- */

const fallbackFasilitas = [
  { name: "Ruang Kelas Bersih", icon: "chalkboard" },
  { name: "Gedung 3 Lantai Milik Sendiri", icon: "building" },
  { name: "Lapangan Olahraga", icon: "sport" },
  { name: "Lapangan Futsal", icon: "sport" },
  { name: "Musholla", icon: "mosque" },
  { name: "Kantin", icon: "utensils" },
  { name: "Koperasi", icon: "store" },
  { name: "Keamanan 24 Jam", icon: "shield" },
  { name: "Lab. Komputer", icon: "laptop" },
] as const;

/* ---------------- TYPES ---------------- */

interface Facility {
  id?: string;
  name: string;
  icon: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
}

export type UIFacility = {
  id: string;
  name: string;
  icon: keyof typeof ICONS;
  description?: string;
  imageUrl?: string;
};

type FacilityWithValidIcon = Facility & {
  icon: FacilityIconKey;
};

/* ---------------- COMPONENT ---------------- */

export default function Fasilitas({
  facilities = [],
  role,
}: {
  facilities?: Facility[];
  role?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const hasValidIcon = (f: Facility): f is FacilityWithValidIcon =>
    f.icon in FACILITY_ICON_MAP;

  const uiFacilities: UIFacility[] =
    facilities && facilities.length > 0
      ? facilities
          .filter(hasValidIcon)
          .filter((f) => f.isActive !== false)
          .map((f, index) => ({
            id: f.id ?? `fallback-${index}`,
            name: f.name,
            icon: f.icon,
            description: f.description ?? undefined,
            imageUrl: f.imageUrl ?? undefined,
          }))
      : fallbackFasilitas.map((f, i) => ({
          id: `fallback-${i}`,
          name: f.name,
          icon: f.icon,
        }));

  const isOneCol = uiFacilities.length === 1 || uiFacilities.length < 10;

  return (
    <section id="fasilitas" className="py-20 px-4 sm:px-6">
      <div className="relative max-w-6xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12 drop-shadow">
          Fasilitas Sekolah
        </h2>
        {role === "admin" && (
          <Link
            href="/settings"
            className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-lamaPurple text-black rounded-full p-2 shadow transition"
            title="Edit Fasilitas"
          >
            <Image src="/updateDark.png" alt="edit" width={16} height={16} />
          </Link>
        )}
        <div
          className={`grid gap-6 items-start ${
            isOneCol ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"
          }`}
        >
          {uiFacilities.map((item, i) => {
            const Icon = ICONS[item.icon];
            const isOpen = openId === item.id;
            const hasDetail = item.description || item.imageUrl;
            return (
              <div
                key={item.id}
                className="group w-full max-w-xl mx-auto bg-white/20 backdrop-blur-md rounded-xl p-6 shadow-lg transition hover:-translate-y-1"
              >
                {/* HEADER */}
                <button
                  disabled={!hasDetail}
                  onClick={() =>
                    hasDetail && setOpenId(isOpen ? null : item.id)
                  }
                  className={`w-full flex items-center gap-4 text-left ${
                    hasDetail ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div className="flex-shrink-0 text-orange-400 text-3xl">
                    <Icon />
                  </div>

                  <p className="text-white font-medium">{item.name}</p>
                </button>

                {/* EXPANDABLE DETAIL */}
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-white/20 space-y-3 text-sm text-white/90">
                    {item.imageUrl && (
                      <div className="relative w-full max-w-md mx-auto rounded-lg overflow-hidden bg-white/10">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={800}
                          height={500}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    )}

                    {item.description && (
                      <p className="leading-relaxed">{item.description}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
