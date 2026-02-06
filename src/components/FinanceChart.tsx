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

const formatNumber = (value: number) => value.toLocaleString("id-ID"); // adds commas/dots for Rupiah style

// helper for YAxis to avoid overflow (e.g., up to 1B → "1M", "1B")
const shortenNumber = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}Ml`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}Jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}Rb`;
  return value.toString();
};

const FinanceChart = ({ chartData }: { chartData: FinanceData[] }) => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">SPP Tahun Ini</h1>
        <Link href="list/payment">
          <Image src="/moreDark.png" alt="" width={20} height={20}></Image>
        </Link>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
            tickMargin={20}
            tickFormatter={shortenNumber}
          />
          <Tooltip formatter={(value: any) => formatNumber(value as number)} />
          <Legend
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
          />
          <Line
            type="monotone"
            name="Lunas"
            dataKey="lunas"
            stroke="#4caf50"
            strokeWidth={5}
          />
          <Line
            type="monotone"
            name="Belum Lunas"
            dataKey="belum_lunas"
            stroke="#8884d8"
            strokeWidth={5}
          />
          <Line
            type="monotone"
            name="Sebagian Dibayar"
            dataKey="sebagian_dibayar"
            stroke="#f59e0b"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
