"use client";
import { Calendar, momentLocalizer, Views, View } from "react-big-calendar";
import moment from "moment";
import { useState, useEffect } from "react";
import "moment/locale/id"; // ✅ import locale

moment.locale("id"); // ✅ set locale

const localizer = momentLocalizer(moment);
const messages = {
  date: "Tanggal",
  time: "Waktu",
  event: "Acara",
  allDay: "Sepanjang Hari",
  week: "Minggu",
  work_week: "Hari Kerja",
  day: "Hari",
  month: "Bulan",
  previous: "Sebelumnya",
  next: "Berikutnya",
  yesterday: "Kemarin",
  tomorrow: "Besok",
  today: "Hari Ini",
  agenda: "Agenda",
  noEventsInRange: "Tidak ada acara dalam rentang waktu ini.",
  showMore: (total: number) => `+${total} lainnya`,
};

const BigCalendar = ({
  data,
}: {
  data: { title: string; start: Date; end: Date }[];
}) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);
  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  return (
    <Calendar
      localizer={localizer}
      events={data}
      startAccessor="start"
      endAccessor="end"
      views={["work_week", "day", "month"]}
      view={view}
      style={{ height: "600px" }}
      // defaultDate={data[0]?.start ?? new Date()}
      messages={messages}
      onView={handleOnChangeView}
      min={new Date(2025, 1, 0, 6, 0, 0)}
      max={new Date(2025, 1, 0, 17, 0, 0)}
    />
  );
};

export default BigCalendar;
