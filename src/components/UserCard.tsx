import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

const UserCard = async ({
  type,
}: {
  type: "staff" | "teacher" | "student" | "parent";
}) => {
  let data: number = 0;

  switch (type) {
    case "staff":
      data = await prisma.staff.count();
      break;
    case "teacher":
      data = await prisma.teacher.count();
      break;
    case "student":
      data = await prisma.student.count();
      break;
    case "parent":
      data = await prisma.parent.count();
      break;
    default:
      data = 0;
  }
  // console.log(data);
  const now = new Date();

  // Format the date as Month/Year (e.g., 11/2025)
  const formattedDate = now.toLocaleDateString("en-US", {
    month: "2-digit",
    year: "numeric",
  });
  const typeMap: Record<string, string> = {
    staff: "Staf",
    teacher: "Guru",
    student: "Siswa",
    parent: "Wali Murid",
  };
  return (
    <div className="rounded-2xl odd:bg-lamaBlue even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          {formattedDate}
        </span>
        <Link href={`/list/${type}s`}>
          <Image src="/more.png" alt="" width={20} height={20} />
        </Link>
      </div>
      <h1 className="text-2xl font-semibold my-4">{data}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">
        {typeMap[type]}
      </h2>
    </div>
  );
};

export default UserCard;
