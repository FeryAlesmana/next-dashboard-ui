import UserCard from "@/components/UserCard";
import FinanceChart from "@/components/FinanceChart";
import Announcements from "@/components/Announcements";
import CountChartCountainer from "@/components/CountChartCountainer";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

interface AdminPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const sp = await searchParams; // resolve the Promise
  const normalized: { [k: string]: string | undefined } = {};
  Object.entries(sp ?? {}).forEach(([k, v]) => {
    normalized[k] = Array.isArray(v) ? v[0] : v;
  });
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Fetch all payments for this year
  const payments = await prisma.paymentLog.findMany({
    where: {
      OR: [{ paidAt: { gte: startOfYear } }, { dueDate: { gte: startOfYear } }],
    },
    select: {
      amount: true,
      status: true,
      paidAt: true,
      dueDate: true,
      paymentInstallments: {
        select: { amount: true },
      },
    },
  });

  // Initialize monthly buckets
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyData = months.map((name, index) => ({
    name,
    lunas: 0,
    belum_lunas: 0,
    sebagian_dibayar: 0,
  }));

  function safeDecimal(value: Decimal) {
    return value && typeof value === "object" && value.toNumber
      ? value.toNumber()
      : Number(value);
  }

  for (const payment of payments) {
    let date: Date | null = null;

    if (
      (payment.status === "PAID" || payment.status === "PARTIALLY_PAID") &&
      payment.paidAt
    ) {
      // use paidAt when fully or partially paid
      date = payment.paidAt;
    } else if (payment.dueDate) {
      // fallback to dueDate for pending/overdue
      date = payment.dueDate;
    }

    if (date) {
      const monthIdx = date.getMonth();

      if (payment.status === "PAID") {
        monthlyData[monthIdx].lunas += safeDecimal(payment.amount);
      } else if (payment.status === "PARTIALLY_PAID") {
        // add all installment amounts
        const installmentTotal = payment.paymentInstallments.reduce(
          (sum, inst) => sum + safeDecimal(inst.amount),
          0
        );
        monthlyData[monthIdx].sebagian_dibayar += installmentTotal;
      } else {
        monthlyData[monthIdx].belum_lunas += safeDecimal(payment.amount);
      }
    }
  }

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="admin" />
          <UserCard type="student" />
          <UserCard type="teacher" />
          <UserCard type="parent" />
        </div>
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartCountainer />
          </div>
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>
        <div className="w-full h-[500px]">
          <FinanceChart chartData={monthlyData} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={normalized} />
        <Announcements />
      </div>
    </div>
  );
}
