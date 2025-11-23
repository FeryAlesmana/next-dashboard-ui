"use client";
import FormModal from "../FormModal";
import NameListPopover from "../NamePopover";
import { BaseTableClientProps } from "./AssignmentTableClient";

const ClassesTableClient = ({
  data,
  role,
  selected,
  onToggle,
  relatedData,
  onDeleted,
  onChanged,
  allowedStaff,
}: BaseTableClientProps) => {
  return (
    <tr
      key={data.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {allowedStaff && (
        <td className="px-4 py-2">
          <input
            type="checkbox"
            checked={selected?.includes(data.id)}
            onChange={() => onToggle(data.id)}
          />
        </td>
      )}
      <td className="flex items-center p-2 md:p-4 gap-4 ">{data.name}</td>
      <td className="hidden md:table-cell">
        {data._count?.students !== undefined
          ? `${data._count.students}/${data.capacity ?? 0}`
          : `0/${data.capacity ?? 0}`}
      </td>
      <td className="">
        <NameListPopover
          items={data.students.map((student: any) => ({
            id: student.id,
            img: student.img,
            name: student.name,
            className: student.class?.name,
          }))}
          label="Murid"
        />
      </td>
      <td className="hidden md:table-cell">{data.name[0]}</td>
      <td className="hidden md:table-cell">
        {data.supervisor ? `${data.supervisor.name ?? ""} `.trim() : "-"}
      </td>
      {/* data.students ? `${data.students._count}/ ${data.capacity}` : "-" */}
      <td>
        <div className="flex items-center gap-2">
          {allowedStaff && (
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
