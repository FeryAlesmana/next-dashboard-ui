"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type StudentLessonChartProps = {
  data: { status: string; count: number }[];
};

const StudentLessonChart = ({ data }: StudentLessonChartProps) => {
  const statusColors: Record<string, string> = {
    HADIR: "#22c55e", // green
    SAKIT: "#eab308", // yellow
    ABSEN: "#ef4444", // red
  };
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="horizontal" // so Y = status, X = count
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        barSize={30}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {/* Y axis = jumlah */}
        <YAxis
          type="number"
          allowDecimals={false}
          label={{
            value: "Total",
            angle: -90,
            position: "insideLeft",
            fill: "#374151",
            fontSize: 12,
          }}
        />
        <XAxis
          type="category"
          dataKey="status"
          tick={{ fill: "#374151", fontSize: 12 }}
        />
        {/* Tooltip with custom label */}
        <Tooltip
          formatter={
            (value: any, name: string) => [value, "Jumlah"] // rename "count" → "Jumlah"
          }
        />
        <Bar dataKey="count" radius={[5, 5, 5, 5]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={statusColors[entry.status] || "#4f46e5"} // fallback to purple
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StudentLessonChart;
