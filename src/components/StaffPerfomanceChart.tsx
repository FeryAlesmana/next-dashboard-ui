"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import FormModal from "./FormModal";

const MONTHS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function getMonthLabel(ym: string) {
  // "2025-03" -> 03 -> 2 -> MONTHS_ID[2] = Mar
  const idx = parseInt(ym.split("-")[1], 10) - 1;
  return MONTHS_ID[idx] ?? ym;
}

export default function StaffPerformanceChart({
  logs,
  onSelect,
  staffId,
}: {
  logs: any[];
  onSelect: (log: any) => void;
  staffId: string;
}) {
  // no useMemo → compute inline
  const chartData = logs.map((log) => ({
    ...log,
    label: getMonthLabel(log.month),
  }));

  return (
    <div className="bg-white rounded-xl w-full h-full p-4 ">
      {/* TITLE */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-semibold text-gray-800">Performa Staff</h1>
        <FormModal
          table="staffPerfomance"
          type="create"
          id={staffId}
        ></FormModal>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          onClick={(e) => {
            if (e && e.activePayload) {
              const payload = e.activePayload[0].payload;
              const cx = e.activeCoordinate?.x;
              const cy = e.activeCoordinate?.y;

              onSelect({
                ...payload,
                x: cx,
                y: cy,
              });
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />

          <XAxis
            dataKey="label"
            axisLine={false}
            tick={{ fill: "#d1d5db", fontSize: 12 }}
            tickLine={false}
          />

          <YAxis
            domain={[
              0,
              Math.max(...logs.map((l) => l.score)) + 5, // small padding above max
            ]}
            axisLine={false}
            tick={{ fill: "#d1d5db", fontSize: 12 }}
            tickLine={false}
            tickMargin={10}
          />

          <Tooltip
            formatter={(v: any, _name: any, p: any) => [
              `${v} poin`,
              `Bulan: ${p.payload.label}`,
            ]}
            labelFormatter={() => ""}
            contentStyle={{
              borderRadius: "10px",
              borderColor: "#eee",
              fontSize: "12px",
            }}
          />

          <Line
            type="monotone"
            dataKey="score"
            name="Skor"
            stroke="#4f46e5"
            strokeWidth={4}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-2">
        Klik titik pada grafik untuk mengedit data bulan tersebut.
      </p>
    </div>
  );
}
