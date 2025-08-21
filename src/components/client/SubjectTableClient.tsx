"use client";
import { assTypes } from "@prisma/client";
import FormModal from "../FormModal";
export type BaseTableClientProps = {
  data: any;
  role: string;
  selected: string[];
  relatedData?: any;
  onToggle: (id: string) => void;
  onDeleted?: (ids: (string | number)[]) => void;
  onChanged?: (item: any) => void;
};

export default function SubjectTableClient({
  data,
  role,
  selected,
  onToggle,
  relatedData,
  onDeleted,
  onChanged,
}: BaseTableClientProps) {
  return (
    <>
      <tr className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
        {role === "admin" && (
          <td className="px-4 py-2">
            <input
              type="checkbox"
              checked={selected?.includes(data.id)}
              onChange={() => onToggle(data.id)}
            />
          </td>
        )}

        <td className="text-center">{data.id}</td>
        <td className="p-4 gap-4 text-center">{data.name}</td>
        <td className="hidden md:table-cell">
          {data.teachers.map((teacher: any) => teacher.name).join(",")}
        </td>
        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal
                  table="subject"
                  type="update"
                  data={data}
                  relatedData={relatedData}
                  onChanged={onChanged}
                ></FormModal>
                <FormModal
                  table="subject"
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
