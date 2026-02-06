// StudentFinanceContainer.tsx
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import StudentFinanceChart from "./StudentFinanceChart";

const StudentFinanceContainer = async ({ studentId }: { studentId: string }) => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  const payments = await prisma.paymentLog.findMany({
    where: {
      studentId: studentId, // Query for the specific student
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

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const monthlyData = months.map((name) => ({
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
    let date: Date | null = payment.status === "PAID" || payment.status === "PARTIALLY_PAID" 
      ? payment.paidAt 
      : payment.dueDate;

    if (date && date >= startOfYear) {
      const monthIdx = date.getMonth();

      if (payment.status === "PAID") {
        monthlyData[monthIdx].lunas += safeDecimal(payment.amount);
      } else if (payment.status === "PARTIALLY_PAID") {
        const installmentTotal = payment.paymentInstallments.reduce(
          (sum, inst) => sum + safeDecimal(inst.amount as Decimal),
          0
        );
        monthlyData[monthIdx].sebagian_dibayar += installmentTotal;
      } else {
        monthlyData[monthIdx].belum_lunas += safeDecimal(payment.amount);
      }
    }
  }

  return <StudentFinanceChart chartData={monthlyData} />;
};

export default StudentFinanceContainer;