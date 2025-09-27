import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  getAdminNotifications,
  getParentNotifications,
  getStudentNotifications,
  getTeacherNotifications,
} from "@/lib/utils";

export async function GET() {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const clerkId = user?.id;

  if (!clerkId || !role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let notifications: any[] = [];
  switch (role) {
    case "admin":
      notifications = await getAdminNotifications();
      break;
    case "student":
      notifications = await getStudentNotifications(clerkId);
      break;
    case "teacher":
      notifications = await getTeacherNotifications(clerkId);
      break;
    case "parent":
       notifications = await getParentNotifications(clerkId);
      break;

    default:
      break;
  }

  return NextResponse.json({ notifications });
}
