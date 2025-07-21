"use client";
import { ReactElement, ReactNode } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AttendanceChart = ({
  data,
}: {
  data: { name: string; hadir: number; sakit: number; absen: number }[];
}) => {
  const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // 0=Monday, ..., 6=Sunday
  const todayName = daysOfWeek[currentDayIndex];

  const renderCustomTick: (props: any) => React.ReactElement<SVGElement> = ({
    x,
    y,
    payload,
  }) => {
    if (x === undefined || y === undefined || !payload?.value) {
      return <text x={0} y={0}></text>;
    }

    const isToday = payload.value === todayName;

    return (
      <text
        x={x}
        y={y + 10}
        textAnchor="middle"
        fontWeight={isToday ? "bold" : "normal"}
        fill={isToday ? "#4f46e5" : "#9ca3af"}
        fontSize="12px"
      >
        {payload.value}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="90%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        barSize={20}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={renderCustomTick}
        />
        <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
        />
        <Legend
          align="left"
          verticalAlign="top"
          wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
        />

        <Bar
          dataKey="hadir"
          fill="#4caf50"
          name="Hadir"
          legendType="circle"
          radius={[5, 5, 0, 0]}
        />
        <Bar
          dataKey="sakit"
          fill="#ff9800"
          name="Sakit"
          legendType="circle"
          radius={[5, 5, 0, 0]}
        />
        <Bar
          dataKey="absen"
          fill="#f44336"
          name="Absen"
          legendType="circle"
          radius={[5, 5, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;
