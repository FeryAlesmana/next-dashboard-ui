import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";

type EventList = Event & { class: Class };

const EventListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const sp = normalizeSearchParams(searchParams);
  const { page, ...queryParams } = await sp;
  const p = page ? parseInt(page) : 1;

  const { role, userId } = await getCurrentUser();
  const columns = [
    {
      header: "Nama event",
      accessor: "subjects",
    },
    {
      header: "Kelas",
      accessor: "kelas",
    },
    {
      header: "Tanggal",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    {
      header: "Waktu Mulai",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "Selesai",
      accessor: "endTime",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Aksi",
            accessor: "action",
          },
        ]
      : []),
  ];

  let supervisedClassIds: number[] = [];

  if (role === "teacher") {
    const supervisedClasses = await prisma.class.findMany({
      where: { supervisorId: userId! },
      select: { id: true },
    });

    supervisedClassIds = supervisedClasses.map((cls) => cls.id);
  }

  const renderRow = (item: EventList) => {
    const canEdit =
      role === "admin" ||
      (role === "teacher" && supervisedClassIds.includes(item.classId ?? -1));
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center p-4 gap-4">{item.title}</td>
        <td>{item.class?.name || "-"} </td>
        <td className="hidden md:table-cell">
          {new Intl.DateTimeFormat("en-US").format(item.startTime)}
        </td>
        <td className="hidden md:table-cell">
          {item.startTime.toLocaleTimeString("en-UK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </td>
        <td className="hidden md:table-cell">
          {item.endTime.toLocaleTimeString("en-UK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </td>

        <td>
          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <FormContainer
                  table="event"
                  type="update"
                  data={item}
                ></FormContainer>
                <FormContainer
                  table="event"
                  type="delete"
                  id={item.id}
                ></FormContainer>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const query: Prisma.EventWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined)
        switch (key) {
          case "search":
            query.title = { contains: value, mode: "insensitive" };
          default:
            break;
        }
    }
  }
  // ROLE CONDITIONS

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  if (role !== "admin") {
    query.OR = [
      { classId: null },
      { class: roleConditions[role as keyof typeof roleConditions] || {} },
    ];
  }

  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      orderBy: {
        startTime: "asc",
      },
      where: query,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.event.count({ where: query }),
  ]);

  // console.log("Current role:", role);
  // console.log("Generated OR filter:", JSON.stringify(query.OR, null, 2));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Semua Acara</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch></TableSearch>
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14}></Image>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14}></Image>
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="event" type="create"></FormContainer>
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <div className="">
        <Table columns={columns} renderRow={renderRow} data={data}></Table>
      </div>
      {/* PAGINATION*/}
      <div className="">
        <Pagination page={p} count={count}></Pagination>
      </div>
    </div>
  );
};

export default EventListPage;
