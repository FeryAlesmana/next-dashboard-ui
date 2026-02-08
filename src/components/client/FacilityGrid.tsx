"use client";

import FacilityCard from "./FacilityCard";
import FormModal from "../FormModal";

export default function FacilityGrid({ facilities }: any) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!facilities || facilities.length === 0 ? (
          <div>
            <span className="text-center text-gray-500 py-6">
              Tidak ada Fasilitas untuk sekarang
            </span>
          </div>
        ) : (
          <>
            {facilities.map((facility: any) => (
              <div key={facility.id}>
                <FacilityCard facility={facility} />
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

FacilityGrid.AddButton = function AddButton() {
  return (
    <>
      <FormModal table="facilities" type="create" />
    </>
  );
};
