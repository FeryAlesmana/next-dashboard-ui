import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  type: string;
  message: string;
  className?: string;
  meetingId?: number;
  lessonId?: number;
  createdAt: string;
  studentId?: string;
  read?: boolean; // new field for state
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        // assume API does not return "read", initialize it as false
        const withReadFlag = (data.notifications || []).map(
          (n: Notification) => ({
            ...n,
            read: n.read ?? false,
          })
        );
        setNotifications(withReadFlag);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  // When dropdown opens, mark all as read
  useEffect(() => {
    if (open) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, [open]);

  return (
    <div className="relative">
      {/* Bell */}
      <div
        onClick={() => setOpen(!open)}
        className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative"
      >
        <Image
          src="/announcement.png"
          alt="Notifications"
          className="w-5 h-5"
          width={20}
          height={20}
        />
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            {unreadCount}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-md p-3 z-50">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.map((n) => {
                // dynamic href based on type
                let href = "#";

                switch (n.type) {
                  case "assignment":
                    href = `/list/assignments?id=${n.id.replace(
                      "assignment-",
                      ""
                    )}`;
                    break;

                  case "ppdb":
                    href = `/list/ppdb?id=${n.id}`;
                    break;

                  case "announcement":
                    href = `/list/announcements?id=${n.id.replace(
                      "announcement-",
                      ""
                    )}`;
                    break;

                  // Add more cases as needed
                  case "event":
                    href = `/list/events?id=${n.id.replace("event-", "")}`;
                    break;
                  case "result":
                    href = `/list/results?id=${n.studentId}`;
                    break;
                  case "attendance":
                    href = `/list/attendance/${n.className}/${n.lessonId}`;
                    break;

                  default:
                    href = "#";
                    break;
                }

                return (
                  <li
                    key={n.id}
                    className={`p-2 border-b text-sm text-gray-700 last:border-none rounded 
                    ${n.read ? "bg-gray-100" : "bg-white"}`}
                  >
                    <Link
                      href={href}
                      className="hover:bg-lamaPurpleLight rounded-md block"
                    >
                      {n.message}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
