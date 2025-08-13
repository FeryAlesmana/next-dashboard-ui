"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import {
  announcementSchema,
  AnnouncementSchema,
} from "@/lib/formValidationSchema";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import {
  createAnnouncement,
  CurrentState,
  updateAnnouncement,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AnnouncementForm = ({
  setOpen,
  type,
  data,
  relatedData,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
  relatedData: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
  });
  const createAnnouncementHandler = async (
    prevState: CurrentState,
    payload: AnnouncementSchema
  ): Promise<CurrentState> => {
    return await createAnnouncement(prevState, payload);
  };

  const updateAnnouncementHandler = async (
    prevState: CurrentState,
    payload: AnnouncementSchema
  ): Promise<CurrentState> => {
    return await updateAnnouncement(prevState, payload);
  };

  const [state, formAction] = useActionState(
    type === "create" ? createAnnouncementHandler : updateAnnouncementHandler,
    {
      success: false,
      error: false,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  const onSubmit = handleSubmit((data) => {
    setIsSubmitting(true);

    startTransition(() => {
      formAction(data);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Pengumuman telah berhasil di ${
          type === "create" ? "Tambah!" : "Edit!"
        }`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { kelas2 = [] } = relatedData ?? {};

  return (
    <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tambah Pengumuman baru" : "Edit Pengumuman"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Pengumuman
      </span>
      <div className="flex justify-between flex-wrap gap-4 m-4">
        <InputField
          label="Judul"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        ></InputField>
        <InputField
          label="Deskripsi"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
          type="textarea"
        ></InputField>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Kelas</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
            defaultValue={data?.classId == null ? "" : String(data.classId)}
          >
            <option value="">Semua Kelas</option> {/* <-- empty value */}
            {kelas2.map((kelas: { id: number; name: string }) => (
              <option value={kelas.id} key={kelas.id}>
                {kelas.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
        <InputField
          label="Tanggal"
          name="date"
          type="date"
          defaultValue={
            data?.date ? new Date(data.date).toISOString().split("T")[0] : ""
          }
          register={register}
          error={errors?.date}
        ></InputField>
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>
      {(state.error || Object.keys(errors).length > 0) && (
        <span className="text-red-500">
          Terjadi Kesalahan! {state.message ?? ""}
          <pre>
            {Object.entries(errors)
              .map(([key, val]) => `${key}: ${val?.message}`)
              .join("\n")}
          </pre>
        </span>
      )}

      <div className="text-center pt-4 justify-items-center">
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full mr-2"></span>
          )}
          {isSubmitting
            ? "Memproses..."
            : type === "create"
            ? "Tambah pengumuman"
            : "Update dan Simpan"}
        </button>
      </div>
    </form>
  );
};

export default AnnouncementForm;
