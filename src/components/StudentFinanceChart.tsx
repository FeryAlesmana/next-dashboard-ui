"use client";
import Image from "next/image";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type FinanceData = {
  name: string;
  lunas: number;
  belum_lunas: number;
  sebagian_dibayar: number;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const shortenNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return value.toString();
};

const StudentFinanceChart = ({ chartData }: { chartData: FinanceData[] }) => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Riwayat Pembayaran
        </h1>
        <Link href="/list/payment">
          <Image
            src="/moreDark.png"
            alt="more"
            width={20}
            height={20}
            className="opacity-50 hover:opacity-100 cursor-pointer"
          />
        </Link>
      </div>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={false}
              tickFormatter={shortenNumber}
            />
            <Tooltip
              formatter={(value: number) => formatNumber(value)}
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: "20px" }}
            />
            <Line
              type="monotone"
              name="Lunas"
              dataKey="lunas"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              name="Belum Lunas"
              dataKey="belum_lunas"
              stroke="#ef4444"
              strokeWidth={3}
              strokeDasharray="5 5" // Makes pending look different
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              name="Cicilan"
              dataKey="sebagian_dibayar"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudentFinanceChart;
