import prisma from "@/lib/prisma";
import AttendanceChart from "./AttendanceChart";
import Image from "next/image";
import Link from "next/link";

const AttendanceChartContainer = async () => {
  const today = new Date();
  const lastMonday = new Date(today);
  const dayOfWeek = today.getDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7; // 0 (Mon) - 6 (Sun)
  lastMonday.setDate(today.getDate() - daysSinceMonday);

  lastMonday.setHours(0, 0, 0, 0);

  const resData = await prisma.attendance.findMany({
    where: {
      date: {
        gte: lastMonday,
        lt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        ), // exclusive upper bound to avoid future records
      },
    },
    select: {
      date: true,
      status: true, // Enum-based status
    },
  });

  const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  const attendanceMap: {
    [key: string]: { HADIR: number; SAKIT: number; ABSEN: number };
  } = {
    Senin: { HADIR: 0, SAKIT: 0, ABSEN: 0 },
    Selasa: { HADIR: 0, SAKIT: 0, ABSEN: 0 },
    Rabu: { HADIR: 0, SAKIT: 0, ABSEN: 0 },
    Kamis: { HADIR: 0, SAKIT: 0, ABSEN: 0 },
    Jumat: { HADIR: 0, SAKIT: 0, ABSEN: 0 },
  };

  resData.forEach((item) => {
    const itemDate = new Date(item.date);
    const itemDayIndex = itemDate.getDay();

    if (itemDayIndex >= 1 && itemDayIndex <= 5) {
      const dayName = daysOfWeek[itemDayIndex - 1];
      if (attendanceMap[dayName][item.status] !== undefined) {
        attendanceMap[dayName][item.status] += 1;
      }
    }
  });

  const data = daysOfWeek.map((day) => ({
    name: day,
    hadir: attendanceMap[day].HADIR,
    sakit: attendanceMap[day].SAKIT,
    absen: attendanceMap[day].ABSEN,
  }));

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Kehadiran</h1>
        <Link href="/list/lessons">
          <Image src="/moreDark.png" alt="" width={20} height={20} />
        </Link>
      </div>
      <AttendanceChart data={data} />
    </div>
  );
};

export default AttendanceChartContainer;
