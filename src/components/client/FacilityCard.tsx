"use client";
import {
  FaBuilding,
  FaFootball,
  FaLaptop,
  FaMosque,
  FaUtensils,
} from "react-icons/fa6";
import FormModal from "../FormModal";

export const ICONS: Record<string, any> = {
  building: FaBuilding,
  laptop: FaLaptop,
  mosque: FaMosque,
  utensils: FaUtensils,
  sport: FaFootball,
};

export default function FacilityCard({ facility }: any) {
  const Icon = ICONS[facility.icon];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 flex gap-4">
      <div className="flex-shrink-0">
        {Icon && <Icon className="text-orange-400 text-3xl" />}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold">{facility.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">
          {facility.description}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <FormModal table="facilities" type="update" data={facility} />
        </div>
      </div>
    </div>
  );
}
