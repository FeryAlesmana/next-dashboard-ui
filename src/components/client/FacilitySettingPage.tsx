"use client";
import FacilityGrid from "@/components/client/FacilityGrid";
import { Facility } from "@prisma/client";

export default function FacilitiesSettingsPage({
  facilities,
}: {
  facilities: Facility[];
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fasilitas</h1>
          <p className="text-sm text-gray-500">
            Atur fasilitas sekolah yang akan muncul di halaman home
          </p>
        </div>

        <FacilityGrid.AddButton />
      </div>

      {/* Content */}
      <FacilityGrid facilities={facilities} />
    </div>
  );
}
