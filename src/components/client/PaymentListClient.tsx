"use client";
import { useState } from "react";
import Table from "@/components/Table";
import BulkActions from "../BulkActions";
import { BaseListClientProps } from "./AssignmentListClient";
import FormModal from "../FormModal";
import TableSearch from "../TableSearch";
import FilterSortToggle from "../FilterSortToggle";
import PaymenTableClient from "./PaymentTableClient";
import Link from "next/link";
import Image from "next/image";
import { staffrole } from "@prisma/client";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { MobilePaymentCard } from "./MobilePaymentCard";

export default function PaymentListClient({
  columns,
  data,
  role,
  relatedData,
  options,
  staffrole,
}: BaseListClientProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [localData, setLocalData] = useState(data); // 👈 keep a client copy
  const [currentStaff] = useState<staffrole>(staffrole!);
  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const handleDeleteOptimistic = (ids: (string | number)[]) => {
    setLocalData((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSelected([]); // reset selection
  };
  const handleChanged = (items: any | any[]) => {
    const newItems = Array.isArray(items) ? items : [items]; // normalize to array

    setLocalData((prev) => {
      const updated = [...prev];

      newItems.forEach((item) => {
        const index = updated.findIndex((p) => p.id === item.id);

        if (index !== -1) {
          // update existing row
          updated[index] = { ...updated[index], ...item };
        } else {
          // add new row
          updated.push(item);
        }
      });

      return updated;
    });
  };

  const handleManyChanged = (items: any[]) => {
    setLocalData((prev) =>
      prev.map((p) => {
        const updated = items.find((u) => u.id === p.id);
        return updated ? { ...p, ...updated } : p;
      })
    );
  };

  const handleManyImport = (newItems: any[]) => {
    setLocalData((prev) => {
      const updated = [...prev];

      newItems.forEach((item) => {
        const index = updated.findIndex((p) => p.id === item.id);
        if (index > -1) {
          updated[index] = item; // update existing
        } else {
          updated.unshift(item); // add new
        }
      });

      return updated;
    });
  };

  const {
    classOptions = [],
    gradeOptions = [],
    pStatusOptions = [],
    paymentTypeOptions = [],
    semesterOptions = [],
  } = options || {};
  const allowedStaff = role === "staff" && currentStaff === "ACCOUNTING";
  const allowedRole = role === "admin" || allowedStaff;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const getResponsiveColumns = ({
    role,
    allowedStaff,
    allowedRole,
    isMobile,
  }: {
    role: string;
    allowedStaff: boolean;
    allowedRole: boolean;
    isMobile: boolean;
  }) => {
    // Helper function to conditionally truncate the header
    const getHeader = (desktop: any, mobile: any) =>
      isMobile ? mobile : desktop;

    const columns = [
      ...(allowedRole
        ? [
            {
              // Checkbox header often doesn't need text on mobile
              header: getHeader("Select", "✅"),
              accessor: "checkbox",
            },
          ]
        : []),
      {
        header: getHeader("Nama Murid", "Nama Murid"),
        accessor: "studentId",
      },
      {
        // Nama Calon siswa -> Nama Siswa
        header: getHeader("NISN", "NISN"),
        accessor: "nisn",
        className: "hidden md:table-cell",
      },
      {
        // Tanggal Submit -> Tgl Submit
        header: getHeader("Jenis Pembayaran", "Jenis"),
        accessor: "paymentType",
      },
      {
        // Status Formulir -> Status
        header: getHeader("Jumlah Tagihan", "Jumlah"),
        accessor: "amount",
        className: "hidden md:table-cell",
      },
      {
        header: "Status",
        accessor: "status",
        className: "hidden md:table-cell",
      },
      {
        header: "Jumlah Pembayaran",
        accessor: "paidAmount",
        className: "hidden md:table-cell",
      },
      {
        header: "Tenggat Waktu",
        accessor: "dueDate",
        className: "hidden md:table-cell",
      },
      ...(allowedRole
        ? [
            {
              // 'Aksi' is already short
              header: getHeader("Aksi", "Aksi"),
              accessor: "action",
            },
          ]
        : []),
    ];

    return columns;
  };

  const trueCol = getResponsiveColumns({
    role,
    allowedStaff,
    allowedRole,
    isMobile,
  });

  const isMobileNew = useMediaQuery("(max-width: 768px)");

  return (
    <div className="space-y-4 mt-3">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Log Pembayaran
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {allowedRole && (
              <>
                <FormModal
                  table="bill"
                  type="create"
                  onChanged={handleChanged}
                  relatedData={relatedData}
                />
                <FormModal
                  table="importPayments"
                  type="createMany"
                  onChanged={handleManyImport}
                />
                <FormModal
                  table="exportPayments"
                  type="readMany"
                  onChanged={handleManyImport}
                />
                {role === "admin" && (
                  <>
                    <Link href={`payment/changelog`}>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow shadow-md">
                        <Image
                          src="/changelog.png"
                          alt=""
                          width={16}
                          height={16}
                        />
                      </button>
                    </Link>
                  </>
                )}
              </>
            )}
            <FilterSortToggle
              filterFields={[
                {
                  name: "classId",
                  label: "Kelas",
                  options: classOptions,
                },
                {
                  name: "gradeId",
                  label: "Tingkat",
                  options: gradeOptions,
                },
                {
                  name: "status",
                  label: "Status Pembayaran",
                  options: pStatusOptions,
                },
                {
                  name: "paymentType",
                  label: "Tipe Pembayaran",
                  options: paymentTypeOptions,
                },
                {
                  name: "semester",
                  label: "Semester",
                  options: semesterOptions.map((sem: any) => ({
                    label: sem.label,
                    value: JSON.stringify({
                      start: sem.start.toISOString(),
                      end: sem.end.toISOString(),
                    }),
                  })),
                },
              ]}
              sortOptions={[
                { label: "Tipe Pembayaran", value: "pt" },
                { label: "Tenggat waktu", value: "tw" },
                { label: "ID Asc", value: "id_asc" },
                { label: "ID Desc", value: "id_desc" },
              ]}
            />
          </div>
        </div>
      </div>
      <BulkActions
        selectedIds={selected}
        table="paymentLog"
        onReset={() => setSelected([])}
        data={localData}
        relatedData={relatedData}
        handleChanged={handleChanged}
        handleManyChanged={handleManyChanged}
        onDeleted={handleDeleteOptimistic}
      />
      {isMobile ? (
        <div className="space-y-3">
          {localData.length === 0 ? (
            <div className=" p-4">
              <div className="text-gray-500 text-sm text-center py-6">
                Tidak ada data untuk table ini
              </div>
            </div>
          ) : (
            localData.map((row) => (
              <MobilePaymentCard
                key={row.id}
                data={row}
                selected={selected}
                onToggle={toggleSelection}
                relatedData={relatedData}
                onDeleted={handleDeleteOptimistic}
                onChanged={handleChanged}
                role={role}
                allowedStaff={allowedRole}
              />
            ))
          )}
        </div>
      ) : (
        <Table columns={trueCol}>
          <tr className="text-left text-gray-500 text-sm">
            {allowedRole && (
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selected.length === data.length}
                  onChange={(e) =>
                    setSelected(e.target.checked ? data.map((s) => s.id) : [])
                  }
                />
              </td>
            )}
            {/* other headers */}
          </tr>
          {localData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (role === "admin" ? 1 : 0)}
                className="text-center text-gray-500 py-6"
              >
                Tidak ada data untuk table ini
              </td>
            </tr>
          ) : (
            localData.map((row) => (
              <PaymenTableClient
                key={row.id}
                data={row}
                role={role}
                selected={selected}
                onToggle={toggleSelection}
                relatedData={relatedData}
                onDeleted={handleDeleteOptimistic}
                onChanged={handleChanged}
                allowedStaff={allowedRole}
              />
            ))
          )}
        </Table>
      )}
    </div>
  );
}
