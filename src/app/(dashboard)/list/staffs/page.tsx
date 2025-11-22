import ClientPageWrapper from "@/components/ClientWrapper";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import StaffListClient from "@/components/client/StaffListClient";
import TeacherListClient from "@/components/client/TeacherListClient";
import prisma from "@/lib/prisma";
import {
  decryptPassword,
  getCurrentUser,
  normalizeSearchParams,
} from "@/lib/utils";
import { Class, Prisma, staffrole, Subject, Teacher } from "@prisma/client";

const StaffListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { role } = await getCurrentUser();
  const sp = await normalizeSearchParams(searchParams);
  const key = new URLSearchParams(
    Object.entries(sp).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  const { page, limit, ...queryParams } = sp;
  const p = page ? parseInt(page) : 1;
  const perPage = limit === "all" ? 50 : parseInt(limit ?? "10");
  const columns = [
    ...(role === "admin"
      ? [
          {
            header: "Select",
            accessor: "checkbox",
          },
        ]
      : []),
    {
      header: "Nama Staff ",
      accessor: "info",
      className: "text-center md:text-left",
    },
    {
      header: "ID Staff",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Jenis Staff",
      accessor: "staffrole",
      className: "hidden md:table-cell",
    },
    {
      header: "No. Tlp",
      accessor: "phone",
      className: "hidden md:table-cell",
    },
    {
      header: "Alamat",
      accessor: "address",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Aksi",
            accessor: "action",
          },
        ]
      : []),
  ];

  const query: Prisma.StaffWhereInput = {};
  let orderBy: Prisma.StaffOrderByWithRelationInput | undefined;

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { id: { contains: value, mode: "insensitive" } },
              { phone: { contains: value, mode: "insensitive" } },
            ];
            break;
          case "byRole":
            query.staffroles = value as staffrole;
            break;
          case "sort":
            switch (value) {
              case "az":
                orderBy = { name: "asc" };
                break;
              case "za":
                orderBy = { name: "desc" };
                break;
              case "id_asc":
                orderBy = { id: "asc" };
                break;
              case "id_desc":
                orderBy = { id: "desc" };
                break;
              case "newest":
                orderBy = { createdAt: "desc" };
                break;
              case "oldest":
                orderBy = { createdAt: "asc" };
                break;
            }
            break;
          default:
            break;
        }
    }
  }

  const [staffs, count] = await prisma.$transaction([
    prisma.staff.findMany({
      where: query,
      orderBy,
      take: perPage,
      skip: perPage ? perPage * (p - 1) : undefined,
    }),
    prisma.staff.count({ where: query }),
  ]);
  let relatedData = {};

  // console.log(data);

  const data = staffs.map((staff) => ({
    ...staff,
    password: decryptPassword(staff.password),
  }));
  const staffRoles = [
    { label: "Penjadwalan", value: "PENDJADWALAN" },
    { label: "Akutansi", value: "ACCOUNTING" },
  ];
  let options = { staffRoles };

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <StaffListClient
            data={data}
            role={role!}
            columns={columns}
            count={count}
            relatedData={relatedData}
            options={options}
          />
        </div>
        {/* PAGINATION*/}
        <div className="">
          <Pagination page={p} count={count}></Pagination>
        </div>
      </div>
    </ClientPageWrapper>
  );
};

export default StaffListPage;
