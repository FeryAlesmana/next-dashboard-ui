"use client";

import { useEffect, useState, useCallback } from "react";
import SemesterSelect from "./SemesterSelect";

type Semester = {
  label: string;
  start: Date;
  end: Date;
};

export default function StudentPaymentView({
  userId,
  gradeLevel,
}: {
  userId: string;
  gradeLevel: number;
}) {
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const generateSemesters = (gradeLevel: number): Semester[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startYear = currentYear - (gradeLevel - 1);

    const generated: Semester[] = [];

    for (let year = startYear; year <= currentYear; year++) {
      generated.push({
        label: `Ganjil ${year}/${year + 1}`,
        start: new Date(`${year}-07-01`),
        end: new Date(`${year}-12-31`),
      });
      generated.push({
        label: `Genap ${year}/${year + 1}`,
        start: new Date(`${year + 1}-01-01`),
        end: new Date(`${year + 1}-06-30`),
      });
    }

    return generated.reverse();
  };

  const fetchPayments = useCallback(async () => {
    if (!selectedSemester) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/parent-payments?studentId=${userId}&startDate=${selectedSemester.start.toISOString()}&endDate=${selectedSemester.end.toISOString()}`
      );
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Failed to fetch student payments:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedSemester]);

  useEffect(() => {
    const sems = generateSemesters(gradeLevel);
    setSemesters(sems);
    setSelectedSemester(sems[0]); // Default to most recent
  }, [gradeLevel]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pembayaran Saya</h1>

      <div className="mb-4 flex justify-end">
        <SemesterSelect
          semesters={semesters}
          selected={selectedSemester!}
          onChange={(s) => setSelectedSemester(s)}
          placeholder="Pilih Semester..."
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Memuat data...</div>
      ) : payments.length === 0 ? (
        <div className="text-center text-gray-500">
          Tidak ada tagihan untuk semester ini.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-center">Jenis Pembayaran</th>
                <th className="px-4 py-3 text-center">Jumlah</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Jatuh Tempo</th>
                <th className="px-4 py-3 text-center">Dibayar Pada</th>
                <th className="px-4 py-3 text-center">Metode</th>
                <th className="px-4 py-3 text-center">Deskripsi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 text-center">
              {payments.map((pay: any) => (
                <tr
                  key={pay.id}
                  className="even:bg-slate-50 hover:bg-lamaPurpleLight"
                >
                  <td className="p-3">{pay.paymentType}</td>
                  <td className="p-3">
                    Rp {pay.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                        ${
                          pay.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                        ${
                          pay.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                        ${
                          pay.status === "OVERDUE"
                            ? "bg-red-100 text-red-800"
                            : ""
                        }
                        ${
                          pay.status === "PARTIALLY_PAID"
                            ? "bg-blue-100 text-blue-800"
                            : ""
                        }
                      `}
                    >
                      {pay.status === "PENDING" && "Belum Dibayar"}
                      {pay.status === "PAID" && "Lunas"}
                      {pay.status === "OVERDUE" && "Terlambat"}
                      {pay.status === "PARTIALLY_PAID" && "Dibayar Sebagian"}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(pay.dueDate).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-3">
                    {pay.paidAt
                      ? new Date(pay.paidAt).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  <td className="p-3">{pay.paymentMethod || "-"}</td>
                  <td className="p-3">{pay.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
