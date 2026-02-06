import Image from "next/image";
import prisma from "@/lib/prisma";
import Link from "next/link";
import AttendancePieChart from "./AttendancePieChart";

const StudentAttendanceContainer = async ({ id }: { id: string }) => {
  const attendances = await prisma.attendance.findMany({
    where: {
      studentId: id,
      meeting: {
        date: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    },
    select: {
      status: true,
    },
  });

  const total = attendances.length;

  // Function to count and calculate percentage
  const getStats = (status: "HADIR" | "SAKIT" | "ABSEN" | "IZIN") => {
    const count = attendances.filter((a) => a.status === status).length;
    const perc = total > 0 ? Math.round((count / total) * 100) : 0;
    return { count, perc };
  };

  const hadir = getStats("HADIR");
  const sakit = getStats("SAKIT");
  const absen = getStats("ABSEN");
  const izin = getStats("IZIN");

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Kehadiran (Tahun Ini)</h1>
        <Link href="/list/lessons">
          <Image src="/moreDark.png" alt="" width={20} height={20} />
        </Link>
      </div>

      {/* CHART - Passing detailed counts */}
      <div className="relative w-full h-[250px]">
        <AttendancePieChart
          hadir={hadir.count}
          sakit={sakit.count}
          absen={absen.count}
          izin={izin.count}
        />
      </div>

      {/* BOTTOM STATS */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* HADIR */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-lamaSky rounded-full"></div>
            <span className="text-xs font-bold text-gray-700">Hadir</span>
          </div>
          <h1 className="font-bold text-sm">
            {hadir.count} ({hadir.perc}%)
          </h1>
        </div>
        {/* SAKIT */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-lamaYellow rounded-full"></div>
            <span className="text-xs font-bold text-gray-700">Sakit</span>
          </div>
          <h1 className="font-bold text-sm">
            {sakit.count} ({sakit.perc}%)
          </h1>
        </div>
        {/* IZIN */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span className="text-xs font-bold text-gray-700">Izin</span>
          </div>
          <h1 className="font-bold text-sm">
            {izin.count} ({izin.perc}%)
          </h1>
        </div>
        {/* ABSEN */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-xs font-bold text-gray-700">Absen</span>
          </div>
          <h1 className="font-bold text-sm">
            {absen.count} ({absen.perc}%)
          </h1>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceContainer;
