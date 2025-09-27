import Image from "next/image";
import EventList from "./EventList";
import EventCalender from "./EventCalender";
import Link from "next/link";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { date } = searchParams;
  return (
    <div className="bg-white p-4 rounded-md">
      <EventCalender />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Kegiatan</h1>
        <Link href="list/events">
          <Image src="/moreDark.png" alt="" width={20} height={20}></Image>
        </Link>
      </div>
      <div className="flex flex-col gap-4"></div>
      <EventList dateParam={date}></EventList>
    </div>
  );
};

export default EventCalendarContainer;
