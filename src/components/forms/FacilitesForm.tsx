"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  eventSchema,
  EventSchema,
  facilitySchema,
  FacilitySchema,
} from "@/lib/formValidationSchema";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  createEvent,
  createFacility,
  CurrentState,
  updateEvent,
  updateFacility,
} from "@/lib/actions";
import ConfirmDialog from "../ConfirmDialog";
import UploadPhoto from "../UploadPhoto";
import { BaseFormProps } from "./AssignmentForm";

const FacilitiesForm = ({
  setOpen,
  type,
  data,
  relatedData,
  onChanged,
}: BaseFormProps) => {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FacilitySchema>({
    resolver: zodResolver(facilitySchema),
  });

  const createFacilitiesHandler = async (
    prevState: CurrentState,
    payload: FacilitySchema,
  ): Promise<CurrentState> => {
    return await createFacility(prevState, payload);
  };

  const updateFacilitiesHandler = async (
    prevState: CurrentState,
    payload: FacilitySchema,
  ): Promise<CurrentState> => {
    return await updateFacility(prevState, payload);
  };

  const [state, formAction] = useActionState(
    type === "create" ? createFacilitiesHandler : updateFacilitiesHandler,
    { success: false, error: false },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<FacilitySchema | null>(null);
  const [imageUrl, setImg] = useState<any>();
  const router = useRouter();

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  useEffect(() => {
    if (state.success) {
      toast(
        `Fasilitas telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`,
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  // Submit akhir setelah konfirmasi dialog
  const submitForm = () => {
    if (!formData) return;
    setIsSubmitting(true);

    startTransition(() => {
      formAction(formData);
    });
    setShowConfirm(false);
  };

  // Handle submit form: validasi dulu, jika valid baru simpan data & tampilkan dialog konfirmasi
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await trigger();
    if (valid) {
      handleSubmit((data) => {
        const payload: any = {
          ...data,
          imageUrl: imageUrl?.secure_url,
        };
        setFormData(payload);
        setShowConfirm(true);
      })();
    } else {
      setShowConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">
            {type === "create" ? "Tambah Fasilitas Baru" : "Edit Fasilitas"}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Informasi fasilitas yang akan ditampilkan di website
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT — Image Upload */}
          <div className="md:col-span-1 flex justify-center">
            <UploadPhoto
              imageUrl={imageUrl?.secure_url || data?.imageUrl}
              onUpload={(url) => setImg({ secure_url: url })}
            />
          </div>

          {/* RIGHT — Form Fields */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* Name */}
            <InputField
              label="Nama Fasilitas"
              name="name"
              defaultValue={data?.name}
              register={register}
              error={errors?.name}
              placeholder="Masukkan nama fasilitas"
              table="student"
            />

            {/* Description */}
            <InputField
              label="Deskripsi"
              name="description"
              defaultValue={data?.description}
              register={register}
              error={errors?.description}
              type="textarea"
              placeholder="Minimal 10 karakter"
              table="student"
              inputProps={{ rows: 5 }}
            />

            {/* Icon + Active */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Icon */}
              <div>
                <label className="text-xs text-gray-400">Icon</label>
                <select
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("icon")}
                  defaultValue={data?.icon ?? ""}
                >
                  <option value="">Pilih Icon</option>
                  <option value="laptop">Laptop</option>
                  <option value="building">Gedung</option>
                  <option value="mosque">Masjid</option>
                  <option value="utensils">Kantin</option>
                  <option value="sport">Olahraga</option>
                </select>
                {errors.icon?.message && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.icon.message.toString()}
                  </p>
                )}
              </div>

              {/* Active */}
              <div className="flex items-end">
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    defaultChecked={data?.isActive ?? true}
                    {...register("isActive")}
                    className="w-4 h-4 accent-orange-500"
                  />
                  Fasilitas Aktif
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden ID (edit only) */}
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
                ? "Tambah Fasilitas"
                : "Update dan Simpan"}
          </button>
        </div>
      </form>

      {showConfirm && (
        <ConfirmDialog
          message={
            type === "create"
              ? "Tambah Fasilitas baru?"
              : "Simpan perubahan Fasilitas?"
          }
          onConfirm={submitForm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default FacilitiesForm;
