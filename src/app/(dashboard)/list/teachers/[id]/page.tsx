"use server";
import Announcements from "@/components/Announcements";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Image from "next/image";
import Link from "next/link";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { Class, Teacher } from "@prisma/client";
import { notFound } from "next/navigation";
import FormContainer from "@/components/FormContainer";
import { decryptPassword, getCurrentUser } from "@/lib/utils";
import EmailCopy from "@/components/EmailCopy";

const SingleTeacherPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { userId, role } = await getCurrentUser();

  // Block users from viewing others' profiles unless they are admin
  if (!role) {
    return notFound();
  }
  const teacher:
    | (Teacher & {
        _count: { subjects: number; lessons: number; classes: number };
      })
    | null = await prisma.teacher.findUnique({
    where: {
      id,
    },
    include: {
      subjects: true,
      lessons: true,
      classes: true,
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
        },
      },
    },
  });

  if (!teacher) {
    return notFound();
  }

  let teacherWithDecryptedPassword = {
    ...teacher,
    password: teacher.password ? decryptPassword(teacher.password) : "",
  };
  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row flex-1">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-8">
        {/* TOP */}
        <div className=" flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-xl flex-1 flex flex-col items-center lg:flex-row lg:items-start lg:gap-4">
            <div className="w-full lg:w-1/3 flex justify-center mb-4 lg:mb-0">
              <Image
                src={teacher.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-32 h-32 md:w-48 md:h-48 xl:w-52 xl:h-52 rounded-full object-cover"
              ></Image>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1
                  className="text-xl font-semibold max-w-full md:max-w-[300px] 
               overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {teacher.name}
                </h1>
                {role === "admin" && (
                  <FormContainer
                    table="teacher"
                    type="update"
                    data={teacherWithDecryptedPassword}
                  ></FormContainer>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {teacher.address}
                {teacher.rt && teacher.rw
                  ? `, RT ${teacher.rt}/RW ${teacher.rw}`
                  : ""}
                {teacher.kelurahan ? `, Kel. ${teacher.kelurahan}` : ""}
                {teacher.kecamatan ? `, Kec. ${teacher.kecamatan}` : ""}
                {teacher.kota ? `, ${teacher.kota}` : ""}
              </p>

              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14}></Image>
                  <span>
                    {new Intl.DateTimeFormat("en-UK").format(teacher.birthday)}
                  </span>
                </div>
                <EmailCopy email={teacher.email} />
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14}></Image>
                  <span>{teacher.phone}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            {/* <div className="w-full bg-white p-4 rounded-md flex gap-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                height={24}
                width={24}
                className="w-6 h-6"
              ></Image>
            </div> */}
            {/* CARD */}
            <div className="w-full bg-white p-4 rounded-md flex gap-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                height={24}
                width={24}
                className="w-6 h-6"
              ></Image>
              <div className="">
                <h1 className="text-xl font-semibold">
                  {teacher._count.subjects}
                </h1>
                <span className="text-sm text-gray-400">Cabang</span>
              </div>
            </div>
            {/* CARD */}
            <div className="w-full bg-white p-4 rounded-md flex gap-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleLesson.png"
                alt=""
                height={24}
                width={24}
                className="w-6 h-6"
              ></Image>
              <div className="">
                <h1 className="text-xl font-semibold">
                  {teacher._count.lessons}
                </h1>
                <span className="text-sm text-gray-400">Jadwal Guru</span>
              </div>
            </div>
            {/* CARD */}
            <div className="w-full bg-white p-4 rounded-md flex gap-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                height={24}
                width={24}
                className="w-6 h-6"
              ></Image>
              <div className="">
                <h1 className="text-xl font-semibold">
                  {teacher._count.classes}
                </h1>
                <span className="text-sm text-gray-400">Kelas</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[823px]">
            <div className="h-full bg-white p-4 rounded-md">
              <h1 className="text-xl font-semibold">Jadwal Guru</h1>
              <BigCalendarContainer type="teacherId" id={teacher?.id!} />
            </div>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/classes?supervisorId=${teacher.id}`}
            >
              Kelas
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/students?teacherId=${teacher.id}`}
            >
              Murid
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight"
              href={`/list/lessons?teacherId=${teacher.id}`}
            >
              Mengajar materi
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50"
              href={`/list/exams?teacherId=${teacher.id}`}
            >
              Ujian
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/assignments?teacherId=${teacher.id}`}
            >
              Tugas
            </Link>
          </div>
        </div>
        <Announcements></Announcements>
      </div>
    </div>
  );
};

export default SingleTeacherPage;
