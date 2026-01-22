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
import { ChangeAction, staffrole } from "@prisma/client";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { MobilePaymentCard } from "./MobilePaymentCard";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ChangeItemPopover from "../ChangeItemPopOver";
import { MobilePaymentChangeCard } from "./MobilePaymentChangeCard";

export default function PaymentChangeListClient({
  columns,
  data,
  role,
  relatedData,
  options,
}: BaseListClientProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [localData, setLocalData] = useState(data); // 👈 keep a client copy
  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
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

  function translateStaffRole(role?: string): string {
    switch (role) {
      case "PENILAIAN":
        return "Penilaian & Kesiswaan";
      case "PENJADWALAN":
        return "Penjadwalan";
      case "ACCOUNTING":
        return "Akuntansi";
      default:
        return "-";
    }
  }
  function translateChangeAction(action?: ChangeAction) {
    switch (action) {
      case "CREATE_BILL":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Buat Tagihan
          </span>
        );

      case "CREATE_PAYMENTS":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            Tambah Pembayaran
          </span>
        );

      case "UPDATE_BILL":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Edit Tagihan
          </span>
        );

      case "DELETE_BILL":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Hapus Tagihan
          </span>
        );

      case "DELETE_PAYMENTS":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
            Hapus Pembayaran
          </span>
        );

      case "REVERT":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Revert
          </span>
        );

      case "UNREVERT":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            -
          </span>
        );

      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            -
          </span>
        );
    }
  }

  const { roleOptions = [], actOptions = [] } = options || [];
  const allowedRole = role === "admin";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const getResponsiveColumns = ({
    allowedRole,
    isMobile,
  }: {
    allowedRole: boolean;
    isMobile: boolean;
  }) => {
    // Helper function to conditionally truncate the header
    const getHeader = (desktop: any, mobile: any) =>
      isMobile ? mobile : desktop;

    const columns = [
      {
        header: getHeader("Id Tagihan", "Id"),
        accessor: "id",
      },
      {
        // Status Formulir -> Status
        header: getHeader("Nama Staff dan role", "Nama"),
        accessor: "name",
      },
      {
        header: getHeader("Jenis Aksi", "Jenis"),
        accessor: "action",
      },
      {
        // Tanggal Submit -> Tgl Submit
        header: getHeader("Di Ubah pada", "Pada"),
        accessor: "paymentType",
      },

      ...(allowedRole
        ? [
            {
              // 'Aksi' is already short
              header: getHeader("Aksi", "Aksi"),
              accessor: "Caction",
            },
          ]
        : []),
    ];

    return columns;
  };

  const trueCol = getResponsiveColumns({
    allowedRole,
    isMobile,
  });

  const [openRow, setOpenRow] = useState<number | null>(null);
  const toggleRow = (id: number) => {
    setOpenRow((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4 mt-3">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Log Perubahan Pembayaran
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterSortToggle
              filterFields={[
                { name: "byRole", label: "Role", options: roleOptions },
                { name: "action", label: "Aksi", options: actOptions },
              ]}
              sortOptions={[
                { label: "Terbaru", value: "newest" },
                { label: "Paling Lama", value: "oldest" },
                { label: "ID Asc", value: "id_asc" },
                { label: "ID Desc", value: "id_desc" },
              ]}
            />
          </div>
        </div>
      </div>
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
              <MobilePaymentChangeCard
                key={row.id}
                data={row}
                selected={selected}
                onToggle={toggleSelection}
                relatedData={relatedData}
                onDeleted={handleDeleteOptimistic}
                onChanged={handleChanged}
                role={role}
                allowedStaff={allowedRole}
                onToggleRow={toggleRow}
                onClose={() => setOpenRow(null)}
                openRow={openRow}
              />
            ))
          )}
        </div>
      ) : (
        <>
          <Table columns={trueCol}>
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
              localData.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
                >
                  <td className="hidden md:table-cell px-5">
                    {row.paymentLogId || "-"}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col">
                      <h3 className="font-semibold truncate">
                        {row.changedByName || "Staff"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {translateStaffRole(row.changedByRole)}
                      </p>
                    </div>
                  </td>

                  <td className="hidden md:table-cell">
                    {translateChangeAction(row.action)}
                  </td>

                  <td className="hidden md:table-cell">
                    {new Date(row.createdAt).toLocaleString("id-ID")}
                  </td>

                  <td className="hidden md:table-cell">
                    <button
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky shadow-md"
                      onClick={() =>
                        setOpenRow(openRow === row.id ? null : row.id)
                      }
                    >
                      <Image src="/view.png" alt="" width={16} height={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </Table>
          {openRow && (
            <ChangeItemPopover
              item={localData.find((r) => r.id === openRow)}
              index={localData.findIndex((r) => r.id === openRow) + 1}
              onClose={() => setOpenRow(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
