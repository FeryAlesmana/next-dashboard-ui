"use client";
import { useState } from "react";

export default function AddMeetingButton({ lessonId, onAdded }: { lessonId: number, onAdded: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleAddMeeting = async () => {
    setLoading(true);
    try {
      // Fetch current meetings to get next meetingNo
      const res = await fetch(`/api/meetings?lessonId=${lessonId}`);
      const meetings = await res.json();
      const nextMeetingNo = meetings.length + 1;
      // Create new meeting
      await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, meetingNo: nextMeetingNo }),
      });
      onAdded();
    } catch (err) {
      alert("Gagal menambah pertemuan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
      onClick={handleAddMeeting}
      disabled={loading}
    >
      {loading ? "Menambah..." : "Tambah Pertemuan"}
    </button>
  );
}
