import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role, resultsData } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

type Result = {
  id: number;
  subject: string;
  student: string;
  teacher: string;
  class: string;
  date: string;
  type: "Ujian" | "Tugas";
  score: number;
};
const columns = [
  {
    header: "Mata Pelajaran",
    accessor: "subjects",
  },
  {
    header: "Murid",
    accessor: "student",
  },
  {
    header: "Nilai",
    accessor: "score",
  },
  {
    header: "Guru",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "Kelas",
    accessor: "class",
  },
  {
    header: "Tanggal",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Aksi",
    accessor: "action",
  },
];
const ResultListPage = () => {
  const renderRow = (item: Result) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center p-4 gap-4">{item.subject}</td>
      <td>{item.student}</td>
      <td className="hidden md:table-cell">{item.score}</td>
      <td className="hidden md:table-cell">{item.teacher}</td>
      <td className="hidden md:table-cell">{item.class}</td>
      <td className="hidden md:table-cell">{item.date}</td>

      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/Exams/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/edit.png" alt="" width={16} height={16}></Image>
            </button>
          </Link>
          {role === "admin" && (
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
              <Image src="/delete.png" alt="" width={16} height={16}></Image>
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Semua Nilai</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch></TableSearch>
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14}></Image>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14}></Image>
            </button>
            {role === "admin" && (
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/plus.png" alt="" width={14} height={14}></Image>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <div className="">
        <Table
          columns={columns}
          renderRow={renderRow}
          data={resultsData}
        ></Table>
      </div>
      {/* PAGINATION*/}
      <div className="">
        <Pagination></Pagination>
      </div>
    </div>
  );
};

export default ResultListPage;
