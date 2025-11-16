import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent";
}) => {
  let data: number;

  const client = await clerkClient();

  if (type === "admin") {
    // Count admins by fetching Clerk users page-by-page and filtering by publicMetadata.role
    const limit = 500; // Clerk max page size
    let offset = 0;
    let adminsCount = 0;

    while (true) {
      const res = await client.users.getUserList({
        limit,
        offset,
      });

      // filter this page by publicMetadata.role === "admin"
      const adminInPage = res.data.filter(
        (u) => (u.publicMetadata as any)?.role === "admin"
      ).length;

      adminsCount += adminInPage;

      // if returned less than limit, we've reached the last page
      if (res.data.length < limit) break;

      offset += limit;
    }

    data = adminsCount;
  } else if (type === "teacher") {
    data = await prisma.teacher.count();
  } else if (type === "student") {
    data = await prisma.student.count();
  } else {
    // parent
    data = await prisma.parent.count();
  }
  // console.log(data);

  return (
    <div className="rounded-2xl odd:bg-lamaBlue even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          2021/25
        </span>
        <Link href={`/list/${type}s`}>
          <Image src="/more.png" alt="" width={20} height={20} />
        </Link>
      </div>
      <h1 className="text-2xl font-semibold my-4">{data}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
    </div>
  );
};

export default UserCard;
