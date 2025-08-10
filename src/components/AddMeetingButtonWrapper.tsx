"use client";
import AddMeetingButton from "@/components/AddMeetingButton";

export default function AddMeetingButtonWrapper({ lessonId }: { lessonId: number }) {
  return <AddMeetingButton lessonId={lessonId} onAdded={() => window.location.reload()} />;
}
