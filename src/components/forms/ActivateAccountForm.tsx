"use client";

import { useState, Dispatch, SetStateAction, startTransition } from "react";
import { toast } from "react-toastify";
import {
  activateManyParents,
  activateManyStudents,
  activateManyTeachers,
} from "@/lib/actions";
import { useRouter } from "next/navigation";

type ActivateAccountFormProps = {
  setOpen: Dispatch<SetStateAction<boolean>>;
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "ppdb"
    | "paymentLog"
    | "importTeachers"
    | "importStudents"
    | "user"
    | "eskul"
    | "hero"
    | "gallery";
  ids: string[];
};

export default function ActivateAccountForm({
  setOpen,
  table,
  ids,
}: ActivateAccountFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleActivate = async () => {
    setLoading(true);

    try {
      let res;
      switch (table) {
        case "student":
          res = await activateManyStudents(ids);
          break;
        case "teacher":
          res = await activateManyTeachers(ids);
          break;
        case "parent":
          res = await activateManyParents(ids);
          break;
        default:
          throw new Error("Unsupported table for activation");
      }

      // ✅ Always show summary first
      toast[res.success ? "success" : "error"](res.message);

      // ✅ If there are failed items, show them one by one
      if (Array.isArray(res.failed) && res.failed.length > 0) {
        res.failed.forEach((f: any) => {
          toast.error(
            `${f.username || "(unknown)"} gagal${
              f.field ? ` karena ${f.field}` : ""
            }: ${f.message}`,
            { autoClose: false }
          );
        });
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Terjadi Kesalahan!");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h3 className="text-lg font-semibold">Aktifkan Akun {table}</h3>
      <p className="text-gray-600 text-sm">
        Apakah Anda yakin ingin mengaktifkan {ids.length} akun
        {ids.length > 1 ? " tersebut" : " ini"}?
      </p>
      <div className="flex gap-3">
        <button
          disabled={loading}
          onClick={handleActivate}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Activating..." : "Activate"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
