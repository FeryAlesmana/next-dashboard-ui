"use client";
import FormModal from "../FormModal";

export default function ParentTableClient({
  data,
  role,
  selected,
  onToggle,
  relatedData,
}: {
  data: any;
  role: string;
  selected: string[];
  relatedData: any;
  onToggle: (id: string) => void;
}) {
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

        <td className="flex items-center p-4 gap-4">
          <div className="flex flex-col">
            <h3 className="font-semibold">{data.name}</h3>
            <p className="text-xs text-gray-500">{data?.email}</p>
          </div>
        </td>
        <td className="hidden md:table-cell">{data.waliMurid || "-"}</td>
        <td className="hidden md:table-cell">
          {[
            ...data.students,
            ...data.secondaryStudents,
            ...data.guardianStudents,
          ].length > 0
            ? [
                ...data.students,
                ...data.secondaryStudents,
                ...data.guardianStudents,
              ]
                .map((student: any) => student.name)
                .join(", ")
            : "-"}
        </td>

        <td className="hidden md:table-cell">{data.phone}</td>
        <td className="hidden md:table-cell">{data.address}</td>
        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal
                  table="parent"
                  type="update"
                  data={data}
                  relatedData={relatedData}
                ></FormModal>
                <FormModal
                  table="parent"
                  type="delete"
                  id={data.id}
                ></FormModal>
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
