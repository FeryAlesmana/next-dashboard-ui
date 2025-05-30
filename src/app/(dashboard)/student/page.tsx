import Announcements from "@/components/Announcements"
import BigCalendar from "@/components/BigCalendar"
import EventCalender from "@/components/EventCalender"
import "react-big-calendar/lib/css/react-big-calendar.css"

const StudentPage = () => {
  return (
    <div className='p-4 flex gap-4 flex-col xl:flex-row'>
      {/* left */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Jadwal(4A)</h1>
          <BigCalendar></BigCalendar>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
      <EventCalender></EventCalender>
      <Announcements></Announcements>
      </div>
    </div>
  )
}

export default StudentPage