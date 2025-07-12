import FormContainer from "@/components/FormContainer";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser, normalizeSearchParams } from "@/lib/utils";
import { Class, PPDB, Prisma } from "@prisma/client";
import Image from "next/image";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

type Ppdb = PPDB & { class: Class };

const PpdbPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { role, userId } = await getCurrentUser();
  const sp = await normalizeSearchParams(searchParams);
  const { page, ...queryParams } = await sp;
  const p = page ? parseInt(page) : 1;

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
  const renderRow = (item: Ppdb) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center p-4 gap-4">{item.id}</td>
      <td>{item?.name || "-"}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.createdAt)}
      </td>
      <td className="hidden md:table-cell ">
        {item.isvalid ? (
          <FaCheckCircle className="text-green-500" title="Valid" />
        ) : (
          <FaTimesCircle className="text-red-500" title="Tidak Valid" />
        )}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer
                table="ppdb"
                type="update"
                data={item}
              ></FormContainer>
              <FormContainer
                table="ppdb"
                type="delete"
                id={item.id}
              ></FormContainer>
            </>
          )}
        </div>
      </td>
    </tr>
  );
  const query: Prisma.PPDBWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined)
        switch (key) {
          case "search":
            query.name = { contains: value, mode: "insensitive" };
          default:
            break;
        }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.pPDB.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.pPDB.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Semua Formulir PPDB
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch></TableSearch>
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14}></Image>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14}></Image>
            </button>
            {/* {role === "admin" && (
              <FormModal table="ppdb" type="create"></FormModal>
            )} */}
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

export default PpdbPage;
