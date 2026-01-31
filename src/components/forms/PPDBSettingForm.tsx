"use client";

import { useForm, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  startTransition,
  useActionState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ConfirmDialog from "../ConfirmDialog";

import {
  ppdbSettingSchema,
  PPDBSettingSchema,
} from "@/lib/formValidationSchema";

import { CurrentState, updatePPDBSetting } from "@/lib/actions";
import InputField from "../InputField";
import { cloudinaryUpload } from "@/lib/upload/cloudinaryUpload";
import Link from "next/link";

type Props = {
  setOpen?: Dispatch<SetStateAction<boolean>>;
  type: "update";
  data?: any; // your initial PPDB settings
};

const PPDBSettingForm = ({ setOpen, type, data }: Props) => {
  const router = useRouter();

  const {
    register,
    reset,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<PPDBSettingSchema>({
    resolver: zodResolver(ppdbSettingSchema),
    defaultValues: {
      startDate: data?.startDate
        ? new Date(data.startDate).toISOString().split("T")[0]
        : "",
      endDate: data?.endDate
        ? new Date(data.endDate).toISOString().split("T")[0]
        : "",
      quota: (data?.quota as number) || 0,
    },
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PPDBSettingSchema | null>(null);

  // Server action wrapper
  const updateHandler = async (
    prevState: CurrentState,
    payload: PPDBSettingSchema,
  ) => {
    return await updatePPDBSetting(prevState, payload);
  };

  const [state, formAction] = useActionState(updateHandler, {
    success: false,
    error: false,
    message: "",
  });

  const [dokumen, setDokumen] = useState<{
    filePpdb?: string;
    deletedFilePpdb?: boolean;
  }>({});

  const [uploadingField, setUploadingField] = useState<
    keyof typeof dokumen | null
  >(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    name: keyof typeof dokumen,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(name);

    try {
      const uploadedUrl = await cloudinaryUpload(file, "ppdb");

      setDokumen((prev) => ({ ...prev, [name]: uploadedUrl }));
    } catch (err) {
      toast.error("Upload gagal");
    }
  };

  // First submit -> validate -> open confirm modal
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valid = await trigger();
    if (valid) {
      handleSubmit((data) => {
        setFormData(data);
        setShowConfirm(true);
      })();
    }
  };

  // Confirm -> send to server
  const handleConfirmSubmit = () => {
    if (formData) {
      const payload: PPDBSettingSchema = {
        ...formData,
        filePpdb: dokumen.deletedFilePpdb ? null : dokumen.filePpdb,
      };
      setIsSubmitting(true);

      startTransition(() => {
        formAction(payload);
      });
    }
    setShowConfirm(false);
  };

  // After success
  useEffect(() => {
    if (state.success) {
      toast("Pengaturan PPDB berhasil disimpan!");
      setIsSubmitting(false);
      setOpen?.(false);
      router.refresh();
    }
  }, [state, setOpen, router]);

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold">Pengaturan PPDB</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <InputField
            label="Waktu mulai"
            name="startDate"
            register={register}
            error={errors?.startDate}
            type="date"
            table="student"
          />

          <InputField
            label="Waktu selesai"
            name="endDate"
            register={register}
            error={errors?.endDate}
            type="date"
            table="student"
          />

          {/* Quota */}
          <InputField
            label="Kuota"
            name="quota"
            register={register}
            error={errors?.quota}
            type="number"
            table="student"
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-600">File PPDB Offline</label>

            {/* Upload input (only shown if no file yet) */}
            {!dokumen.filePpdb &&
              (!data?.filePpdb || dokumen.deletedFilePpdb) &&
              (uploadingField === "filePpdb" ? (
                <div className="flex items-center justify-center w-full h-10">
                  <svg
                    className="animate-spin h-6 w-6 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  <span className="ml-2 text-sm text-gray-300">
                    Mengunggah...
                  </span>
                </div>
              ) : (
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, "filePpdb")}
                  className="block w-full text-sm text-gray-700
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    border border-gray-300 rounded-md"
                />
              ))}

            {/* Show preview if file exists in local state */}
            {dokumen.filePpdb && (
              <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
                <a
                  href={dokumen.filePpdb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline truncate"
                >
                  Lihat Dokumen (File PPDB Offline)
                </a>
                <button
                  type="button"
                  onClick={() =>
                    setDokumen((prev) => ({
                      ...prev,
                      filePpdb: undefined,
                      deletedFilePpdb: true,
                    }))
                  }
                  className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
                >
                  Hapus
                </button>
              </div>
            )}

            {/* Show preview if file exists in DB but not in local state */}
            {!dokumen.filePpdb &&
              data?.filePpdb &&
              !dokumen.deletedFilePpdb && (
                <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
                  <a
                    href={data?.filePpdb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline truncate"
                  >
                    Lihat Dokumen (File PPDB Offline)
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setDokumen((prev) => ({
                        ...prev,
                        filePpdb: undefined,
                        deletedFilePpdb: true,
                      }))
                    }
                    className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
                  >
                    Hapus
                  </button>
                </div>
              )}
          </div>
        </div>

        <div className="text-center pt-4 justify-items-center">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full mr-2"></span>
            )}
            {isSubmitting ? "Menyimpan ..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>

      {showConfirm && (
        <ConfirmDialog
          message={"Simpan perubahan?"}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default PPDBSettingForm;
