import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getProfileByClerkIdAndRole } from "@/lib/utils";

export async function GET() {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const clerkId = user?.id;

  if (!clerkId || !role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByClerkIdAndRole(clerkId, role);

  return NextResponse.json({
    name: profile?.name ?? "Admin",
    img: profile?.img ?? "/avatar.png",
    role,
  });
}
