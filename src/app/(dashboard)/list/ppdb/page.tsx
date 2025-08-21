import ClientPageWrapper from "@/components/ClientWrapper";
import Pagination from "@/components/Pagination";
import PpdbListClient from "@/components/client/PpdbListClient";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { Class, PPDB, Prisma } from "@prisma/client";
import FilterSortToggle from "@/components/FilterSortToggle";

type Ppdb = PPDB & { class: Class };

const PpdbPage = async ({
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

  const perPage = limit === "all" ? undefined : parseInt(limit ?? "10");

  const columns = [
    {
      header: "No",
      accessor: "nomor",
    },
    {
      header: "Nama Calon siswa",
      accessor: "name",
    },
    {
      header: "Tanggal Submit",
      accessor: "createdAt",
      className: "hidden md:table-cell",
    },
    {
      header: "Status Formulir",
      accessor: "isvalid",
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

  const query: Prisma.PPDBWhereInput = {};
  let orderBy: Prisma.PPDBOrderByWithRelationInput | undefined;

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "")
        switch (key) {
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          case "isvalid":
            if (value === "true") {
              query.isvalid = true;
            } else if (value === "false") {
              query.isvalid = false;
            }
            break;
          case "time":
            const now = new Date();

            if (value === "today") {
              const startOfDay = new Date(now);
              startOfDay.setHours(0, 0, 0, 0);

              const endOfDay = new Date(now);
              endOfDay.setHours(23, 59, 59, 999);

              query.createdAt = { gte: startOfDay, lte: endOfDay };
            }

            if (value === "week") {
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start
              startOfWeek.setHours(0, 0, 0, 0);

              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);
              endOfWeek.setHours(23, 59, 59, 999);

              query.createdAt = { gte: startOfWeek, lte: endOfWeek };
            }

            if (value === "month") {
              const startOfMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
              );
              const endOfMonth = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
              );
              endOfMonth.setHours(23, 59, 59, 999);

              query.createdAt = { gte: startOfMonth, lte: endOfMonth };
            }
            break;

          case "sort":
            switch (value) {
              case "az":
                orderBy = { name: "asc" };
                break;
              case "za":
                orderBy = { name: "desc" };
                break;
              case "oldest":
                orderBy = { createdAt: "asc" };
                break;
              case "newest":
                orderBy = { createdAt: "desc" };
                break;
              case "id_asc":
                orderBy = { id: "asc" };
                break;
              case "id_desc":
                orderBy = { id: "asc" };
                break;
            }
            break;
          default:
            break;
        }
    }
  }

  const [data, count, newStudentGrades, newStudentClasses] =
    await prisma.$transaction([
      prisma.pPDB.findMany({
        where: query,
        orderBy,
        take: perPage,
        skip: perPage ? perPage * (p - 1) : undefined,
      }),
      prisma.pPDB.count({ where: query }),
      prisma.grade.findMany({
        select: {
          id: true,
          level: true,
        },
      }),
      prisma.class.findMany({
        include: { _count: { select: { students: true } } },
      }),
    ]);
  let relatedData = {};
  relatedData = {
    grades: newStudentGrades,
    classes: newStudentClasses,
  };

  const pStatusOptions = [
    { label: "Semua", value: "" },
    { label: "Valid", value: "true" },
    { label: "Tidak Valid", value: "false" },
  ];
  const pTimeOptions = [
    { label: "Semua", value: "" },
    { label: "Hari ini", value: "today" },
    { label: "Minggu ini", value: "week" },
    { label: "Bulan ini", value: "month" },
  ];

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Semua Formulir PPDB
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch></TableSearch>
            <div className="flex items-center gap-4 self-end">
              <FilterSortToggle
                filterFields={[
                  {
                    name: "isvalid",
                    label: "Status Validasi",
                    options: pStatusOptions,
                  },
                  {
                    name: "time",
                    label: "Waktu Submit",
                    options: pTimeOptions,
                  },
                ]}
                sortOptions={[
                  { label: "A-Z", value: "az" },
                  { label: "Z-A", value: "za" },
                  { label: "Paling Baru", value: "newest" },
                  { label: "Paling Lama", value: "oldest" },
                  { label: "ID Asc", value: "id_asc" },
                  { label: "ID Desc", value: "id_desc" },
                ]}
              />
            </div>
          </div>
        </div>
        {/* LIST */}
        <div className="">
          {/* <Table columns={columns} renderRow={renderRow} data={data}></Table> */}
          <PpdbListClient
            columns={columns}
            data={data}
            role={role!}
            relatedData={relatedData}
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

export default PpdbPage;
