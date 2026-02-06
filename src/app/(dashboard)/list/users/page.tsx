"use server";
import UserListClient from "@/components/client/UserListClient";
import ClientPageWrapper from "@/components/ClientWrapper";
import FilterSortToggle from "@/components/FilterSortToggle";
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
import { notFound } from "next/navigation";

const UserListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const sp = await normalizeSearchParams(searchParams);
  const { page, limit, ...queryParams } = sp;
  const key = new URLSearchParams(
    Object.entries(sp).reduce(
      (acc, [k, v]) => {
        if (v !== undefined) acc[k] = v;
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();
  const p = sp.search ? 1 : page ? parseInt(page) : 1;
  const perPage = limit === "all" ? 50 : parseInt(limit ?? "10");

  const { role } = await getCurrentUser();

  const columns = [
    ...(role === "admin"
      ? [
          {
            header: "Select",
            accessor: "checkbox",
          },
        ]
      : []),
    { header: "Username dan Role", accessor: "name" },
    { header: "Email", accessor: "email", className: "hidden md:table-cell" },
    {
      header: "User di database",
      accessor: "dbUser",
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

  const client = await clerkClient();
  const { data, totalCount } = await client.users.getUserList({
    // optional fuzzy search across name/email/username:
    query: typeof sp.search === "string" && sp.search ? sp.search : undefined,
    limit: perPage, // match your pagination
    offset: perPage ? perPage * (p - 1) : (p - 1) * 10,
  });

  const rows = [];

  for (const u of data) {
    const stringId = u.id; // Clerk user id

    // Try each table
    const studentUser = await prisma.student.findUnique({
      where: { clerkId: stringId },
      select: {
        id: true,
        name: true,
        clerkId: true,
        password: true,
        email: true,
        img: true,
      },
    });

    const teacherUser = await prisma.teacher.findUnique({
      where: { clerkId: stringId },
      select: {
        id: true,
        name: true,
        clerkId: true,
        password: true,
        email: true,
        img: true,
      },
    });
    const staffUser = await prisma.staff.findUnique({
      where: { clerkId: stringId },
      select: {
        id: true,
        name: true,
        clerkId: true,
        password: true,
        email: true,
        img: true,
      },
    });

    const parentUserRaw = await prisma.parent.findUnique({
      where: { clerkId: stringId },
      select: {
        id: true,
        name: true,
        clerkId: true,
        password: true,
        email: true,
      },
    });
    const parentUser = parentUserRaw ? { ...parentUserRaw, img: null } : null;
    const foundUser =
      studentUser || teacherUser || parentUser || staffUser || undefined;

    rows.push({
      id: u.id,
      dbId: foundUser?.id ?? "",
      img: foundUser?.img ?? "",
      name: u.username || "-",
      clerkId: foundUser?.clerkId ?? "",
      dbName: foundUser?.name || "-",
      email: foundUser?.email ?? "—",
      role: (u.publicMetadata?.role as string | undefined) ?? "—",
      password: foundUser?.password ? decryptPassword(foundUser.password) : "", // ← pulled from student/teacher/parent table
    });
  }
  if (sp.sort) {
    switch (sp.sort) {
      case "az":
        rows.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        rows.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "id_asc":
        rows.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "id_desc":
        rows.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        return notFound();
    }
  }
  // Apply pagination here
  const students = await prisma.student.findMany({
    select: { id: true, name: true, email: true, clerkId: true },
  });

  const teachers = await prisma.teacher.findMany({
    select: { id: true, name: true, email: true, clerkId: true },
  });

  const parents = await prisma.parent.findMany({
    select: { id: true, name: true, email: true, clerkId: true },
  });

  const staffs = await prisma.staff.findMany({
    select: { id: true, name: true, email: true, clerkId: true },
  });

  const usersData = [
    ...students.map((s) => ({
      id: s.id,
      name: s.name,
      role: "student",
      email: s.email,
      clerkId: s.clerkId,
    })),
    ...teachers.map((t) => ({
      id: t.id,
      name: t.name,
      role: "teacher",
      email: t.email,
      clerkId: t.clerkId,
    })),
    ...staffs.map((stf) => ({
      id: stf.id,
      name: stf.name,
      role: "staff",
      email: stf.email,
      clerkId: stf.clerkId,
    })),
    ...parents.map((p) => ({
      id: p.id,
      name: p.name,
      role: "parent",
      email: p.email,
      clerkId: p.clerkId,
    })),
  ];

  let relatedData = { usersData };
  return (
    <ClientPageWrapper key={key} role={role!}>
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        {/* LIST */}
        <div className="">
          <UserListClient
            rows={rows}
            role={role!}
            columns={columns}
            relatedData={relatedData}
          />
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
