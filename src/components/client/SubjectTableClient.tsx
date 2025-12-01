"use client";
import { assTypes } from "@prisma/client";
import FormModal from "../FormModal";
import ExpandableList from "../ExpandableList";
import NameListPopover from "../NamePopover";
import { BaseTableClientProps } from "./AssignmentTableClient";
import TeacherListPopover from "../TeacherListPopover";

export default function SubjectTableClient({
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

        <td className="text-center hidden md:table-cell">{data.id}</td>
        <td className="p-4 gap-4 text-center">{data.name}</td>
        <td className="p-4">
          <NameListPopover
            items={data.teachers.map((t: any) => ({
              id: t.id,
              img: t.img,
              name: t.name,
              email: t.email,
            }))}
            label="Guru"
          />
        </td>
        <td className="p-4">
          <TeacherListPopover label="Jadwal" items={data.lessons} />
        </td>
        <td>
          <div className="flex items-center gap-2">
            {allowedStaff && (
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
