"use client";
import { AnimatePresence, motion } from "framer-motion";
import FormModal from "./FormModal";
import Image from "next/image";

export default function BulkActions({
  selectedIds,
  table,
  onReset,
  data,
  relatedData,
}: {
  selectedIds: string[];
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "ppdb"
    | "paymentLog";
  onReset: () => void;
  data?: any;
  relatedData?: any;
}) {
  if (selectedIds.length === 0) return null;

  return (
    <AnimatePresence>
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between p-4 mb-3 rounded-lg bg-lamaSkyLight border border-lamaSkyLight shadow-md"
        >
          <div>
            <h2 className="text-sm font-medium text-gray-800">
              {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""}{" "}
              selected
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <FormModal type="deleteMany" table={table} ids={selectedIds} />
            <FormModal
              type="updateMany"
              table={table}
              ids={selectedIds}
              data={data}
              relatedData={relatedData}
            />
            <button
              onClick={onReset}
              className="flex items-center justify-center rounded-full hover:bg-gray-300 transition w-7 h-7"
            >
              <Image src="/close.png" height={13} width={13} alt="reset" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
