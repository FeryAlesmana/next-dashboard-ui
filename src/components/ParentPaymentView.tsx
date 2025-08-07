"use client";

import { useCallback, useEffect, useState } from "react";
import SemesterSelect from "./SemesterSelect";

type Semester = {
  label: string;
  start: Date;
  end: Date;
};

export default function ParentPaymentView({
  gradeLevel,
  userId,
}: {
  userId: string;
  gradeLevel: any[];
}) {
  const [selectedSemesters, setSelectedSemesters] = useState<{
    [studentId: string]: Semester;
  }>({});
  const [studentsWithPayments, setStudentsWithPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const generateSemesters = (gradeLevel: number): Semester[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startYear = currentYear - (gradeLevel - 1);

    const semesters: Semester[] = [];

    for (let year = startYear; year <= currentYear; year++) {
      semesters.push({
        label: `Ganjil ${year}/${year + 1}`,
        start: new Date(`${year}-07-01`),
        end: new Date(`${year}-12-31`),
      });
      semesters.push({
        label: `Genap ${year}/${year + 1}`,
        start: new Date(`${year + 1}-01-01`),
        end: new Date(`${year + 1}-06-30`),
      });
    }

    return semesters.reverse();
  };

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const studentIds = Object.keys(selectedSemesters);

      const data = await Promise.all(
        studentIds.map(async (studentId) => {
          const semester = selectedSemesters[studentId];

          const res = await fetch(
            `/api/parent-payments?studentId=${studentId}&startDate=${semester.start.toISOString()}&endDate=${semester.end.toISOString()}`
          );

          const payments = await res.json();
          return { ...payments, id: studentId };
        })
      );

      setStudentsWithPayments(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSemesters]);

  useEffect(() => {
    if (Object.keys(selectedSemesters).length > 0) {
      fetchPayments();
    }
  }, [selectedSemesters, fetchPayments]);
  useEffect(() => {
    const initialSemesters: { [studentId: string]: Semester } = {};
    gradeLevel.forEach(({ studentId, gradeLevel }) => {
      const semesters = generateSemesters(gradeLevel);
      initialSemesters[studentId] = semesters[0]; // Default to most recent
    });
    setSelectedSemesters(initialSemesters);
  }, [gradeLevel]);

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pembayaran Anak</h1>

      {loading ? (
        <div className="text-center text-gray-400">Memuat data...</div>
      ) : studentsWithPayments.length === 0 ? (
        <div className="text-center text-gray-500">
          Tidak ada data pembayaran untuk anak Anda.
        </div>
      ) : (
        studentsWithPayments.map((student) => {
          const studentGrade = gradeLevel.find(
            (g) => g.studentId === student.id
          );
          const semesters = generateSemesters(studentGrade?.gradeLevel ?? 1);

          return (
            <div key={student.id} className="mb-12">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">
                  {student.name} {student.surname}
                </h2>
                <SemesterSelect
                  semesters={semesters}
                  selected={selectedSemesters[student.id]}
                  onChange={(semester) => {
                    setSelectedSemesters((prev) => ({
                      ...prev,
                      [student.id]: semester,
                    }));
                  }}
                  placeholder="Pilih Semester..."
                />
              </div>

              {student.payments.length === 0 ? (
                <div className="text-center text-gray-500">
                  Belum ada tagihan untuk {student.name}.
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-center">
                          Jenis Pembayaran
                        </th>
                        <th className="px-4 py-3 text-center">Jumlah</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Jatuh Tempo</th>
                        <th className="px-4 py-3 text-center">Dibayar Pada</th>
                        <th className="px-4 py-3 text-center">Metode</th>
                        <th className="px-4 py-3 text-center">Deskripsi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-center">
                      {student.payments.map((pay: any) => (
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
                              {pay.status === "PARTIALLY_PAID" &&
                                "Dibayar Sebagian"}
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
        })
      )}
    </div>
  );
}
