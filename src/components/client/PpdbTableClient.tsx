"use client";
import FormModal from "../FormModal";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { BaseTableClientProps } from "./AssignmentTableClient";

export default function PpdbTableClient({
  data,
  role,
  selected,
  onToggle,
  relatedData,
  onDeleted,
  onChanged,
  allowedStaff,
}: BaseTableClientProps) {
  return (
    <>
      <tr className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
        {allowedStaff && (
          <td className="px-4 py-2">
            <input
              type="checkbox"
              checked={selected?.includes(data.id)}
              onChange={() => onToggle(data.id)}
            />
          </td>
        )}

        <td className=" items-center p-4 gap-4 hidden md:table-cell">
          {data.id}
        </td>
        <td
          className="font-semibold text-gray-600 max-w-full md:max-w-[300px] 
               overflow-hidden text-ellipsis whitespace-nowrap"
          title={data.name}
        >
          {data?.name || "-"}
        </td>
        <td className="hidden md:table-cell">
          {new Intl.DateTimeFormat("en-US").format(data.createdAt)}
        </td>
        <td>
          {data.isvalid ? (
            <FaCheckCircle className="text-green-500" title="Valid" />
          ) : (
            <FaTimesCircle className="text-red-500" title="Tidak Valid" />
          )}
        </td>
        <td>
          <div className="flex items-center gap-2">
            {allowedStaff && (
              <>
                <FormModal
                  table="ppdb"
                  type="update"
                  data={data}
                  relatedData={relatedData}
                  onChanged={onChanged}
                ></FormModal>
                <FormModal
                  table="ppdb"
                  type="delete"
                  id={data.id}
                  onDeleted={() => onDeleted?.([data.id])}
                ></FormModal>
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
