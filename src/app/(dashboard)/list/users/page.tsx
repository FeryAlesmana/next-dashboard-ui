"use server";
import ClientPageWrapper from "@/components/ClientWrapper";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import {
  decryptPassword,
  getCurrentUser,
  normalizeSearchParams,
} from "@/lib/utils";
import { clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";

const UserListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const sp = await normalizeSearchParams(searchParams);
  const { page, ...queryParams } = sp;
  const key = new URLSearchParams(
    Object.entries(sp).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  const p = page ? parseInt(page) : 1;

  const { role } = await getCurrentUser();

  const columns = [
    { header: "Username dan Role", accessor: "name" },
    { header: "Email", accessor: "email" },
    ...(role === "admin"
      ? [
          {
            header: "Aksi",
            accessor: "action",
          },
        ]
      : []),
  ];

  const client = await clerkClient();
  const { data, totalCount } = await client.users.getUserList({
    limit: ITEM_PER_PAGE,
    offset: (p - 1) * ITEM_PER_PAGE,
    // optional fuzzy search across name/email/username:
    query: typeof sp.search === "string" && sp.search ? sp.search : undefined,
  });

  const rows = [];

  for (const u of data) {
    const stringId = u.id; // Clerk user id

    // Try each table
    const studentUser = await prisma.student.findUnique({
      where: { id: stringId },
      select: {
        id: true,
        name: true,
        namalengkap: true,
        password: true,
        email: true,
        img: true,
      },
    });

    const teacherUser = await prisma.teacher.findUnique({
      where: { id: stringId },
      select: {
        id: true,
        name: true,
        namalengkap: true,
        password: true,
        email: true,
        img: true,
      },
    });

    const parentUserRaw = await prisma.parent.findUnique({
      where: { id: stringId },
      select: {
        id: true,
        name: true,
        namalengkap: true,
        password: true,
        email: true,
      },
    });
    const parentUser = parentUserRaw ? { ...parentUserRaw, img: null } : null;
    const foundUser = studentUser || teacherUser || parentUser || undefined;

    rows.push({
      id: u.id,
      img: foundUser?.img ?? "",
      name: u.username || "(no name)",
      email: foundUser?.email ?? "—",
      role: (u.publicMetadata?.role as string | undefined) ?? "—",
      password: foundUser?.password ? decryptPassword(foundUser.password) : "", // ← pulled from student/teacher/parent table
      namalengkap: foundUser?.namalengkap ?? null,
    });
  }
  const renderRow = (item: any) => {
    const canEdit = role === "admin";

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center p-4 gap-4">
          <Image
            src={item.img || "/noAvatar.png"}
            alt=""
            width={40}
            height={40}
            className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-xs text-gray-500">{item.role}</p>
          </div>
        </td>
        <td>{item.email}</td>
        <td>
          {canEdit && (
            <div className="flex items-center gap-2">
              <FormContainer
                table="user"
                type="update"
                id={item.id}
                data={item}
              ></FormContainer>
              <FormContainer
                table="user"
                type="delete"
                id={item.id}
              ></FormContainer>
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Semua Pengguna
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="" width={14} height={14} />
              </button>
              {role === "admin" && (
                <FormContainer table="user" type="create"></FormContainer>
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <div>
          <Table columns={columns} renderRow={renderRow} data={rows} />
        </div>
        {/* PAGINATION */}
        <div>
          <Pagination page={p} count={totalCount} />
        </div>
      </div>
    </ClientPageWrapper>
  );
};

export default UserListPage;
