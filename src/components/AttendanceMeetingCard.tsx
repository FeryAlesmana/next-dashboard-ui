import React from "react";

export default function AttendanceMeetingCard({
  meeting,
  attendance,
}: {
  meeting?: {
    meetingNo: number;
    date: Date;
    startTime: Date;
    endTime: Date;
  };
  attendance?: {
    status: "HADIR" | "SAKIT" | "ABSEN";
    date?: Date | null;
  };
}) {
  const getStatusLabel = (status?: "HADIR" | "SAKIT" | "ABSEN") => {
    switch (status) {
      case "HADIR":
        return <span className="text-green-600">Hadir</span>;
      case "SAKIT":
        return <span className="text-yellow-500">Sakit</span>;
      case "ABSEN":
        return <span className="text-red-600">Absen</span>;
      default:
        return <span className="text-gray-400">Belum Diisi</span>;
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-2">
      {meeting && (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-1 md:space-y-0">
          <div className="text-sm text-gray-600">
            Tanggal : {meeting.date.toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-600">
            Jam : {meeting.startTime.toLocaleTimeString()} -{" "}
            {meeting.endTime.toLocaleTimeString()}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center text-sm text-gray-600">
        <div>
          Status presensi: {getStatusLabel(attendance?.status)}
        </div>

        <div>
          Tanggal presensi:{" "}
          {attendance?.date ? attendance.date.toLocaleDateString() : "-"}
        </div>
      </div>
    </div>
  );
}
