import UserCard from "@/components/UserCard";
import FinanceChart from "@/components/FinanceChart";
import Announcements from "@/components/Announcements";
import CountChartCountainer from "@/components/CountChartCountainer";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";

const AdminPage = ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const normalizedSearchParams: { [key: string]: string | undefined } = {};

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    normalizedSearchParams[key] = Array.isArray(value) ? value[0] : value;
  });
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARD */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="admin"></UserCard>
          <UserCard type="student"></UserCard>
          <UserCard type="teacher"></UserCard>
          <UserCard type="parent"></UserCard>
        </div>
        {/* MIDDLE CHART*/}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartCountainer />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[500px]">
          <FinanceChart></FinanceChart>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={normalizedSearchParams} />
        <Announcements></Announcements>
      </div>
    </div>
  );
};

export default AdminPage;
