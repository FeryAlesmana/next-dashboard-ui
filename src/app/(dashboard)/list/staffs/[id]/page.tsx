"use server";
import Announcements from "@/components/Announcements";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import FormContainer from "@/components/FormContainer";
import {
  decryptPassword,
  generateSemesters,
  getCurrentUser,
} from "@/lib/utils";
import EmailCopy from "@/components/EmailCopy";
import { staffrole } from "@prisma/client";
import StaffPerformanceChart from "@/components/StaffPerfomanceChart";
import FormModal from "@/components/FormModal";
import StaffPerformanceSection from "@/components/StaffPerfomanceSection";

type roleType =
  | "admin"
  | "teacher"
  | "student"
  | "parent"
  | "staff"
  | undefined;

const SingleStaffPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { role } = await getCurrentUser();
  if (!role) {
    return notFound(); // Block completely unknown users
  }
  let semesterOptions: any = [];

  const oldest = await prisma.student.findFirst({
    orderBy: { createdAt: "asc" },
    select: { createdAt: true, grade: { select: { level: true } } },
  });

  if (oldest) {
    semesterOptions = generateSemesters(oldest.createdAt, 3, role as roleType);
  }
  // Block users from viewing others' profiles unless they are admin

  const [staff, perfomancelog] = await prisma.$transaction([
    prisma.staff.findUnique({
      where: { id: id },
    }),
    prisma.performanceLog.findMany({
      where: { staffId: id },
      orderBy: { month: "asc" },
    }),
  ]);

  if (!staff) {
    return notFound();
  }
  // console.log(staff, "Staff in single page");

  let staffWithDecryptedPassword = {
    ...staff,
    password: staff.password ? decryptPassword(staff.password) : "",
  };

  const getRoleBadgeStyle = (role: staffrole) => {
    switch (role) {
      case "PENJADWALAN":
        return "bg-indigo-100 text-indigo-700";
      case "ACCOUNTING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  function translateStaffRole(role?: string): string {
    switch (role) {
      case "PENILAIAN":
        return "Penilaian & Kesiswaan";
      case "PENJADWALAN":
        return "Penjadwalan";
      case "ACCOUNTING":
        return "Akuntansi";
      default:
        return "Tidak Dikenal";
    }
  }

  const roleBadgeStyle = getRoleBadgeStyle(staff.staffroles!);
  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row flex-1 font-sans">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-8">
        {/* TOP */}
        <div className=" flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-xl shadow-lg flex-1 flex flex-col items-center lg:flex-row lg:items-start lg:gap-4">
            <div className="w-full lg:w-1/3 flex justify-center mb-4 lg:mb-0">
              <Image
                src={staff.img || "/noAvatar.png"}
                alt="Staff Avatar"
                width={144}
                height={144}
                className="w-32 h-32 md:w-48 md:h-48 xl:w-72 xl:h-72 rounded-full object-cover shadow-md border-4 border-white"
              ></Image>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              {/* NAME, ROLE, & FORM BUTTON */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <h1
                    className="text-2xl font-bold text-gray-800 max-w-full md:max-w-[300px] 
                  overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {staff.name}
                  </h1>
                  {role === "admin" && (
                    <FormContainer
                      table="staff"
                      type="update"
                      data={staffWithDecryptedPassword}
                    ></FormContainer>
                  )}
                </div>

                {/* STAFF ROLE BADGE (NEW FIELD) */}
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${roleBadgeStyle} shadow-sm`}
                >
                  {translateStaffRole(staff.staffroles!) || "-"}
                </span>

                {/* SEX AND RELIGION (NEW FIELDS) */}
                <div className="flex gap-6 text-sm text-gray-700 font-medium mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Jenis Kelamin:</span>
                    <span className="font-semibold">
                      {staff.sex === "MALE" && "Lelaki"}
                      {staff.sex === "FEMALE" && "Perempuan"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Agama:</span>
                    <span className="font-semibold">{staff.religion}</span>
                  </div>
                </div>
              </div>

              {/* ADDRESS DETAILS */}
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-semibold text-gray-600">Alamat: </span>
                {staff.address}
                {staff.rt && staff.rw ? `, RT ${staff.rt}/RW ${staff.rw}` : ""}
                {staff.kelurahan ? `, Kel. ${staff.kelurahan}` : ""}
                {staff.kecamatan ? `, Kec. ${staff.kecamatan}` : ""}
                {staff.kota ? `, ${staff.kota}` : ""}
              </p>

              {/* CONTACT & BIRTHDAY DETAILS */}
              <div className="flex items-center justify-between gap-4 flex-wrap text-sm font-medium mt-4">
                {/* Birthday */}
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image
                    src="/date.png"
                    alt="Birthday Icon"
                    width={14}
                    height={14}
                    className="w-4 h-4"
                  ></Image>
                  <span className="text-gray-700">
                    Tanggal Lahir:{" "}
                    {new Intl.DateTimeFormat("en-UK").format(staff.birthday)}
                  </span>
                </div>
                {/* Email */}
                <EmailCopy email={staff.email} />
                {/* Phone */}
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image
                    src="/phone.png"
                    alt="Phone Icon"
                    width={14}
                    height={14}
                    className="w-4 h-4"
                  ></Image>
                  <span className="text-gray-700">No. Hp: {staff.phone}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          {/*  */}
        </div>
        {/* BOTTOM */}
        {/* <div className="w-full overflow-x-auto bg-white p-4 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Recent Activity
          </h2>
          
        </div> */}
        {/* <FormModal table="staffPerfomance" type="create" id={id}></FormModal> */}
        {perfomancelog.length === 0 ? (
          <div>
            <div className="text-center text-gray-500 py-6 bg-white rounded-md">
              <FormModal
                table="staffPerfomance"
                type="create"
                id={id}
              ></FormModal>
              Tidak ada data untuk diagram ini
            </div>
          </div>
        ) : (
          <>
            <StaffPerformanceSection
              logs={perfomancelog}
              staffId={id}
              role={role!}
            />
          </>
        )}
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <Announcements></Announcements>
      </div>
    </div>
  );
};

export default SingleStaffPage;
