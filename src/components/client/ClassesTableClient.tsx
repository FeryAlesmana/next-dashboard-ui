"use client";
import FormModal from "../FormModal";
import { BaseTableClientProps } from "./AssignmentTableClient";

const ClassesTableClient = ({
  data,
  role,
  selected,
  onToggle,
  relatedData,
  onDeleted,
  onChanged,
}: BaseTableClientProps) => {
  return (
    <tr
      key={data.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {role === "admin" && (
        <td className="px-4 py-2">
          <input
            type="checkbox"
            checked={selected?.includes(data.id)}
            onChange={() => onToggle(data.id)}
          />
        </td>
      )}
      <td className="flex items-center p-4 gap-4">{data.name}</td>
      <td className="hidden md:table-cell">{data.capacity}</td>
      <td className="hidden md:table-cell">{data.name[0]}</td>
      <td className="hidden md:table-cell">
        {data.supervisor
          ? `${data.supervisor.name ?? ""} ${
              data.supervisor.namalengkap ?? ""
            }`.trim()
          : "-"}
      </td>

      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal
                table="class"
                type="update"
                data={data}
                relatedData={relatedData}
                onChanged={onChanged}
              ></FormModal>
              <FormModal
                table="class"
                type="delete"
                id={data.id}
                onDeleted={() => onDeleted?.([data.id])}
              ></FormModal>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ClassesTableClient;
