"use client";
import { Calendar, momentLocalizer, Views, View } from "react-big-calendar";
import moment from "moment";
import { useState, useEffect } from "react";
import "moment/locale/id"; // ✅ import locale

moment.locale("id"); // ✅ set locale

moment.updateLocale("id", {
  week: {
    dow: 1, // 👈 Monday is first day of week
  },
});

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
function combineLocalDateTime(dateISO: string, time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(dateISO); // parsed in browser TZ
  d.setHours(h, m, 0, 0); // LOCAL time
  return d;
}

const BigCalendar = ({
  data,
}: {
  data: {
    title: string;
    start: string;
    end: string;
    date: string;
  }[];
}) => {
  const [view, setView] = useState<View>(Views.WEEK);
  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const calendarData = data.map((item) => ({
    title: item.title,
    start: combineLocalDateTime(item.date, item.start),
    end: combineLocalDateTime(item.date, item.end),
  }));

  return (
    <Calendar
      localizer={localizer}
      events={calendarData}
      startAccessor="start"
      endAccessor="end"
      views={["week", "day", "month"]}
      view={view}
      popup
      popupOffset={{ x: 10, y: 10 }}
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
