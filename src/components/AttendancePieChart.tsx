"use client";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";

interface Props {
  hadir: number;
  sakit: number;
  absen: number;
  izin: number;
}

const AttendancePieChart = ({ hadir, sakit, absen, izin }: Props) => {
  const isDataEmpty = hadir === 0 && sakit === 0 && absen === 0 && izin === 0;

  // Placeholder data if everything is zero
  const data = isDataEmpty
    ? [{ name: "No Data", value: 1, fill: "#e5e7eb" }] // Light gray ring
    : [
        { name: "Hadir", value: hadir, fill: "#C3EBFA" },
        { name: "Sakit", value: sakit, fill: "#FAE27C" },
        { name: "Izin", value: izin, fill: "#C084FC" },
        { name: "Absen", value: absen, fill: "#F87171" },
      ];

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="90%"
            paddingAngle={isDataEmpty ? 0 : 5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isDataEmpty ? (
          <span className="text-gray-400 text-xs font-medium">No Data</span>
        ) : (
          <>
            <span className="text-2xl font-bold">
              {hadir + sakit + absen + izin}
            </span>
            <span className="text-[10px] text-gray-400 uppercase">Total</span>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendancePieChart;
