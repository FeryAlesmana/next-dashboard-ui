"use client";

import { useState } from "react";
import StaffPerformanceChart from "./StaffPerfomanceChart";
import FormModal from "./FormModal";
import { PerformanceLog } from "@prisma/client";
import Image from "next/image";
import PerformanceForm from "./forms/PerfomanceForm";

export default function StaffPerformanceSection({
  logs,
  staffId,
  role,
}: {
  logs: any[];
  staffId: string;
  role: string;
}) {
  const [selectedLog, setSelectedLog] = useState<
    (PerformanceLog & { x: any; y: any }) | null
  >(null);
  const [open, setOpen] = useState(false);
  const [openbutton, setOpenbutton] = useState(false);
  //   console.log(selectedLog, "perfomance Id");
  const allowedRole = role === "admin" && selectedLog;
  return (
    <div className="relative">
      {/* FLOATING BUTTON APPEARS NEXT TO DOT */}
      {openbutton && allowedRole && (
        <div
          className="absolute z-50 flex items-center space-x-2 p-2 rounded-xl bg-white shadow-xl border border-gray-100 transition-all duration-200 ease-in-out"
          style={{
            left: selectedLog.x,
            top: selectedLog.y,
            // Offset the menu slightly below and to the right of the dot for better visibility
            transform: "translate(10px, -50%)",
            minWidth: "150px",
          }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaBlue hover:brightness-90 shadow-md"
            >
              <Image src="/update.png" width={15} height={15} alt="edit" />
            </button>
            <span className="text-sm text-blue-600 font-medium cursor-pointer select-none">
              Ubah
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FormModal
              type="delete"
              table="staffPerfomance"
              id={selectedLog.id}
            />
            <span className="text-sm text-red-600 font-medium cursor-pointer select-none">
              Hapus
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenbutton(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-400 "
            >
              <Image src="/close.png" width={15} height={15} alt="edit" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {open && allowedRole && (
        <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <PerformanceForm
              type="update"
              setOpen={setOpen}
              data={selectedLog}
              staffId={selectedLog.staffId}
            />

            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" width={14} height={14} alt="close" />
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-[500px]">
        <StaffPerformanceChart
          logs={logs}
          onSelect={(log) => {
            // If same log clicked again, just toggle open
            if (selectedLog?.id === log.id) {
              setOpenbutton((prev) => !prev);
            } else {
              setSelectedLog(log);
              setOpenbutton(true); // always open when selecting a new dot
            }
          }}
          staffId={staffId}
        />
        
      </div>
      
    </div>
  );
}
