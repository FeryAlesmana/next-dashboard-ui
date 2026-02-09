"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SemesterSelect from "../SemesterSelect";
import StudentParentTableSkeleton from "../StudentParentTableSkeleton";
import PaymentInstallmentsPreview from "../PaymentInstallmentsPreview";
import { PaymentStatus } from "@prisma/client";
import { toast } from "react-toastify";
import { FaFileDownload } from "react-icons/fa";

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
  const [hydrated, setHydrated] = useState(false);
  const [loadingMap, setLoadingMap] = useState<{
    [studentId: string]: boolean;
  }>({});

  const paymentCache = useRef<{ [key: string]: any[] }>({}); // key = `${studentId}_${semester.label}`

  const generateSemesters = (
    createdAt: Date,
    gradeLevel: number,
  ): Semester[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    // 1. Determine the start of the current Academic Year
    // If we are in Jan-June (0-5), the school year started last year
    const academicYearStart = currentMonth < 6 ? currentYear - 1 : currentYear;

    // 2. Calculate when the student actually started Grade 1
    // If they are in Grade 3 now, they started Grade 1 two years ago
    const studentEntryYear = academicYearStart - (gradeLevel - 1);

    const generated: Semester[] = [];

    // 3. Loop from Entry Year up to the Current Academic Year
    for (let year = studentEntryYear; year <= academicYearStart; year++) {
      // Semester Ganjil (July - Dec)
      generated.push({
        label: `Ganjil ${year}/${year + 1}`,
        start: new Date(`${year}-07-01`),
        end: new Date(`${year}-12-31`),
      });

      // Semester Genap (Jan - June)
      // Only add Genap if the year has actually reached that point
      // Or if it's a past year
      if (year < academicYearStart || currentMonth < 6) {
        generated.push({
          label: `Genap ${year}/${year + 1}`,
          start: new Date(`${year + 1}-01-01`),
          end: new Date(`${year + 1}-06-30`),
        });
      }
    }

    // Filter out semesters that start in the future relative to "now"
    return generated.filter((sem) => sem.start <= now).reverse();
  };

  const fetchPayments = useCallback(
    async (studentId: string, semester: Semester) => {
      const cacheKey = `${studentId}_${semester.label}`;
      if (paymentCache.current[cacheKey]) {
        setStudentsWithPayments((prev) => {
          const other = prev.filter((p) => p.id !== studentId);
          return [...other, { ...paymentCache.current[cacheKey] }];
        });
        return;
      }

      setLoadingMap((prev) => ({ ...prev, [studentId]: true }));

      try {
        const res = await fetch(
          `/api/parent-payments?studentId=${studentId}&startDate=${semester.start.toISOString()}&endDate=${semester.end.toISOString()}`,
        );
        const payments = await res.json();

        const studentData = { ...payments, id: studentId };

        // Cache it
        paymentCache.current[cacheKey] = studentData;

        setStudentsWithPayments((prev) => {
          const other = prev.filter((p) => p.id !== studentId);
          return [...other, studentData];
        });
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoadingMap((prev) => ({ ...prev, [studentId]: false }));
      }
    },
    [],
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("selectedSemesters");
    const parsed = stored ? JSON.parse(stored) : {};

    const initialSemesters: { [studentId: string]: Semester } = {};

    gradeLevel.forEach(({ studentId, gradeLevel, createdAt }) => {
      const semesters = generateSemesters(createdAt, gradeLevel);
      const savedLabel = parsed?.[studentId]?.label;

      const matchedSemester = semesters.find((s) => s.label === savedLabel);
      const selected = matchedSemester || semesters[0];

      initialSemesters[studentId] = selected;
      fetchPayments(studentId, selected);
    });

    setSelectedSemesters(initialSemesters);
  }, [gradeLevel, fetchPayments]);

  const handleSemesterChange = (studentId: string, semester: Semester) => {
    const updated = {
      ...selectedSemesters,
      [studentId]: semester,
    };

    setSelectedSemesters(updated);
    localStorage.setItem("selectedSemesters", JSON.stringify(updated));
    fetchPayments(studentId, semester);
  };
  if (!hydrated) return null;
  // console.log(studentsWithPayments, "student in payment");
  const PAYMENT_TYPE_LABEL: Record<string, string> = {
    TUITION: "SPP",
    EXTRACURRICULAR: "Ekstrakurikuler",
    UNIFORM: "Seragam",
    BOOKS: "Buku",
    OTHER: "Lainnya",
  };

  const STATUS_LABEL: Record<string, string> = {
    PENDING: "Belum Dibayar",
    PAID: "Lunas",
    OVERDUE: "Terlambat",
    PARTIALLY_PAID: "Dibayar Sebagian",
  };

  const STATUS_CLASS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    OVERDUE: "bg-red-100 text-red-800",
    PARTIALLY_PAID: "bg-blue-100 text-blue-800",
  };
  const handleDownloadBerkasPembayaran = async (id: string) => {
    const res = await fetch(`/api/payment/${id}/receipt`);
    if (!res.ok) {
      toast.error("Gagal mengunduh berkas");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.click();

    window.URL.revokeObjectURL(url);
  };
  const handleDownloadBerkasPembayaransemester = async (
    studentId: string,
    start: string,
    end: string,
  ) => {
    const res = await fetch(
      `/api/payment/summary?studentId=${studentId}&start=${start}&end=${end}`,
    );
    if (!res.ok) {
      toast.error("Gagal mengunduh berkas per semester");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.click();

    window.URL.revokeObjectURL(url);
  };
  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tagihan Anak</h1>

      {gradeLevel.map(({ studentId, gradeLevel: gLevel, createdAt }) => {
        const student = studentsWithPayments.find((s) => s.id === studentId);
        const semester = selectedSemesters[studentId];
        const semesters = generateSemesters(createdAt, gLevel);
        const isLoading = loadingMap[studentId];

        const paidPaymentsInSemester =
          semester && student?.payments
            ? student.payments.filter((pay: any) => {
                if (pay.status !== "PAID") return false;

                const dueDate = new Date(pay.dueDate);

                return dueDate >= semester.start && dueDate <= semester.end;
              })
            : [];

        const canDownloadSemesterReceipt =
          !!semester && paidPaymentsInSemester.length > 0;

        return (
          <div key={studentId} className="mb-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2">
              {/* Name (truncate) */}
              <h2
                className="text-xl font-semibold max-w-full md:max-w-[300px] 
               overflow-hidden text-ellipsis whitespace-nowrap"
                title={student?.name} // hover to show full name
              >
                {student?.name || "Murid"}
              </h2>
              <div className="flex items-center gap-2 p-2">
                {canDownloadSemesterReceipt && (
                  <button
                    disabled={!semester}
                    onClick={() => {
                      if (!semester) return;

                      handleDownloadBerkasPembayaransemester(
                        studentId,
                        semester.start.toISOString(),
                        semester.end.toISOString(),
                      );
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded-full shadow-md transition
                                ${
                                  semester
                                    ? "bg-lamaYellow text-white hover:brightness-90"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }
                              `}
                    title={
                      semester
                        ? "Unduh Bukti Pembayaran Semester"
                        : "Pilih semester dulu"
                    }
                  >
                    <FaFileDownload size={16} />
                  </button>
                )}

                {/* Semester Select (moves under name on mobile) */}
                <SemesterSelect
                  semesters={semesters}
                  selected={semester}
                  onChange={(sem) => handleSemesterChange(studentId, sem)}
                  placeholder="Pilih Semester..."
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center text-gray-400">
                <StudentParentTableSkeleton />
              </div>
            ) : !student || student.payments?.length === 0 ? (
              <div className="text-center text-gray-500">
                Tidak ada data pembayaran untuk {student?.name || "murid"}.
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-lg ">
                <table className="min-w-full divide-y divide-gray-200 text-sm hidden md:table">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-center">Jenis Tagihan</th>
                      <th className="px-4 py-3 text-center">Jumlah</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Jatuh Tempo</th>
                      <th className="px-4 py-3 text-center">
                        Jumlah Pembayaran
                      </th>
                      <th className="px-4 py-3 text-center">Metode</th>
                      <th className="px-4 py-3 text-center">Deskripsi</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-center">
                    {student.payments.map((pay: any) => {
                      let paymentStatus: PaymentStatus = "PENDING";
                      let lewat: boolean = false;

                      if (
                        pay.status !== "PAID" &&
                        new Date(pay.dueDate) < new Date()
                      ) {
                        paymentStatus = "OVERDUE";
                        lewat = true;
                      }

                      return (
                        <tr
                          key={pay.id}
                          className="even:bg-slate-50 hover:bg-lamaPurpleLight"
                        >
                          <td className="p-3">
                            {PAYMENT_TYPE_LABEL[pay.paymentType]}
                          </td>

                          <td className="p-3">
                            {Number(pay.amount).toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            })}
                          </td>

                          <td className="p-3">
                            {lewat ? (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium
                                  ${paymentStatus === "OVERDUE" ? "bg-red-100 text-red-800" : ""}
                                `}
                              >
                                {paymentStatus === "OVERDUE" && "Terlambat"}
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CLASS[pay.status]}`}
                              >
                                {STATUS_LABEL[pay.status]}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {new Date(pay.dueDate).toLocaleDateString("id-ID")}
                          </td>
                          <td className="p-3">
                            <PaymentInstallmentsPreview
                              installments={pay.paymentInstallments}
                              totalAmount={Number(pay.amount)}
                              limit={1}
                            />
                          </td>

                          <td className="p-3">{pay.paymentMethod || "-"}</td>
                          <td className="p-3">{pay.description || "-"}</td>
                          <td className="p-3">
                            {pay.status === "PAID" && (
                              <button
                                onClick={() =>
                                  handleDownloadBerkasPembayaran(pay.id)
                                }
                                className="w-7 h-7 text-sm text-white underline bg-lamaGreen flex items-center justify-center rounded-full transition hover:brightness-90 shadow-md"
                              >
                                <FaFileDownload height={16} width={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* MOBILE VIEW */}
                <div className="space-y-4 md:hidden">
                  {student.payments.map((pay: any) => {
                    const overdue =
                      pay.status !== "PAID" &&
                      new Date(pay.dueDate) < new Date();

                    const status = overdue ? "OVERDUE" : pay.status;

                    return (
                      <div
                        key={pay.id}
                        className="border rounded-lg p-4 shadow-sm bg-white space-y-3"
                      >
                        {/* Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold">
                              {PAYMENT_TYPE_LABEL[pay.paymentType]}
                            </p>
                            <p className="text-xs text-gray-500">
                              Jatuh tempo:{" "}
                              {new Date(pay.dueDate).toLocaleDateString(
                                "id-ID",
                              )}
                            </p>
                          </div>

                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CLASS[status]}`}
                          >
                            {STATUS_LABEL[status]}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="text-sm">
                          <p>
                            <span className="text-gray-500">Tagihan:</span>{" "}
                            <strong>
                              {Number(pay.amount).toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              })}
                            </strong>
                          </p>
                        </div>

                        {/* Installments */}
                        <div className="text-sm">
                          <PaymentInstallmentsPreview
                            installments={pay.paymentInstallments}
                            totalAmount={Number(pay.amount)}
                            limit={1}
                          />
                        </div>

                        {/* Meta */}
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>
                            <strong>Metode:</strong> {pay.paymentMethod || "-"}
                          </p>
                          <p>
                            <strong>Deskripsi:</strong> {pay.description || "-"}
                          </p>
                        </div>

                        {/* Action */}
                        {pay.status === "PAID" && (
                          <button
                            onClick={() =>
                              handleDownloadBerkasPembayaran(pay.id)
                            }
                            className="w-full flex items-center justify-center gap-2 text-sm text-white bg-lamaGreen py-2 rounded-md shadow hover:brightness-90"
                          >
                            <FaFileDownload />
                            Unduh Bukti Pembayaran
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
