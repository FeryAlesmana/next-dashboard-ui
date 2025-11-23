"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import InputField from "../InputField";
import { startTransition, useActionState, useEffect, useState } from "react";
import {
  createStaffSchema,
  CreatestaffSchema,
  updateStaffSchema,
  UpdatestaffSchema,
} from "@/lib/formValidationSchema";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  activateManyTeachers,
  createStaff,
  CurrentState,
  updateStaff,
} from "@/lib/actions";
import UploadPhoto from "../UploadPhoto";
import z from "zod";
import ConfirmDialog from "../ConfirmDialog";
import { BaseFormProps } from "./AssignmentForm";

const StaffForm = ({ type, data, setOpen, onChanged }: BaseFormProps) => {
  const schema = type === "create" ? createStaffSchema : updateStaffSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
    setError,
    clearErrors,
  } = useForm<
    typeof schema extends z.ZodTypeAny ? z.infer<typeof schema> : never
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      password: data?.password || "", // ✅ Always set as string to avoid `undefined` issues
    },
  });
  // console.log("✅ TeacherForm rendered");
  const [img, setImg] = useState<any>();
  const createStaffHandler = async (
    prevState: CurrentState,
    payload: CreatestaffSchema
  ): Promise<CurrentState> => {
    return await createStaff(prevState, payload);
  };

  const updateStaffHandler = async (
    prevState: CurrentState,
    payload: UpdatestaffSchema
  ): Promise<CurrentState> => {
    return await updateStaff(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    type === "create" ? createStaffHandler : updateStaffHandler,
    initialState
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const [withUser, setWithUser] = useState(true); // default: true (Clerk enabled)

  useEffect(() => {
    if (!state.success && state.error) {
      if (state.field) {
        setError(state.field as any, { message: state.message });
      } else if (state.code === "USER_NOT_FOUND") {
        setShowActivateDialog(true);
        setPendingData(getValues()); // store form data for retry
      } else {
        toast.error(state.message || "Terjadi kesalahan.");
      }
    }
    setIsSubmitting(false);
  }, [state, setError, getValues]);

  const handleSubmitForm = handleSubmit((data) => {
    setIsSubmitting(true);
    setShowConfirm(false);
    const payload = {
      ...data,
      img: img?.secure_url,
      withUser,
    };

    startTransition(() => {
      formAction(payload);
    });
  });
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true); // Show modal before submit
  };

  const router = useRouter();

  useEffect(() => {
    console.log("✅ data received:", data);
    if (type === "update" && data?.subjects) {
      reset({
        ...data,
        birthday: data?.birthday
          ? new Date(data.birthday).toISOString().split("T")[0]
          : "",
        img: img?.secure_url,
      });
    }
    if (state.success) {
      const updatedItem = state.data ?? data;
      toast(
        `Staff telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      if (onChanged && updatedItem) {
        onChanged(updatedItem); // 🔥 notify parent so it can update localData
      } else {
        router.refresh(); // fallback if no handler passed
      }
      setOpen(false);
      if (type === "create") {
        setTimeout(() => router.push(`/list/staffs/${state.id}`), 3000);
      }
    }
  }, [state, type, setOpen, router, data, reset, img, onChanged, withUser]);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Tambah Staff baru" : "Edit Staff"}
        </h1>
        <span className="text-xs text-gray-400 font-medium">
          Informasi Autentikasi
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <div>
            <InputField
              label="Username"
              name="username"
              defaultValue={data?.username}
              register={register}
              error={errors?.username}
              table="teacher"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <InputField
              label="Email"
              name="email"
              type="email"
              defaultValue={data?.email}
              register={register}
              placeholder="email@example.com"
              error={errors?.email}
              table="teacher"
            />
          </div>

          <div>
            <InputField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              defaultValue={data?.password}
              register={register}
              error={errors?.password}
              table="teacher"
              placeholder="Isi password"
            />
            <label className="flex items-center gap-2 mt-1 text-xs">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              Show password
            </label>
          </div>
        </div>

        <span className="text-xs text-gray-400 font-medium">
          Informasi Personal
        </span>
        <UploadPhoto
          imageUrl={img?.secure_url || data?.img}
          onUpload={(url) => setImg({ secure_url: url })}
        />
        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="Nama Lengkap"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
            placeholder="Masukkan Nama Lengkap Staff"
          ></InputField>
          <InputField
            label="No. Telepon"
            name="phone"
            defaultValue={data?.phone}
            register={register}
            error={errors?.phone}
            placeholder="Masukkan nomor telepon (10-13 digit)"
          ></InputField>
          <InputField
            label="Alamat"
            name="address"
            defaultValue={data?.address}
            register={register}
            error={errors?.address}
            placeholder="Masukkan Alamat Staff"
          ></InputField>
          <InputField
            label="RT"
            name="rt"
            defaultValue={data?.rt}
            register={register}
            error={errors?.rt}
            placeholder="Masukkan RT"
          ></InputField>
          <InputField
            label="RW"
            name="rw"
            defaultValue={data?.rw}
            register={register}
            error={errors?.rw}
            placeholder="Masukkan RW"
          ></InputField>
          <InputField
            label="Kelurahan"
            name="kelurahan"
            defaultValue={data?.kelurahan}
            register={register}
            error={errors?.kelurahan}
            placeholder="Masukkan kelurahan"
          ></InputField>
          <InputField
            label="Kecamatan"
            name="kecamatan"
            defaultValue={data?.kecamatan}
            register={register}
            error={errors?.kecamatan}
            placeholder="Masukkan kecamatan"
          ></InputField>
          <InputField
            label="Kota"
            name="kota"
            defaultValue={data?.kota}
            register={register}
            error={errors?.kota}
            placeholder="Masukkan kota/kabupaten"
          ></InputField>
          <InputField
            label="Birthday"
            name="birthday"
            type="date"
            defaultValue={
              data?.birthday
                ? new Date(data.birthday).toISOString().split("T")[0]
                : ""
            }
            register={register}
            error={errors?.birthday}
          ></InputField>
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-400">Agama</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("religion")}
              defaultValue={data?.religion}
            >
              <option value="">Pilih</option>
              <option value="Islam">Islam</option>
              <option value="Kristen">Kristen</option>
              <option value="Buddha">Budha</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            {errors.religion?.message && (
              <p className="text-xs text-red-400">
                {errors.religion.message.toString()}
              </p>
            )}
          </div>
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

          <div className="flex flex-col gap-2 w-full md:w-1/4 ">
            <label className="text-xs text-gray-400">Jenis Kelamin</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("sex")}
              defaultValue={data?.sex}
            >
              <option value="MALE">Lelaki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
            {errors.sex?.message && (
              <p className="text-xs text-red-400">
                {errors.sex.message.toString()}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/4 ">
            <label className="text-xs text-gray-400">Peran Staff</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("staffrole")}
              defaultValue={data?.staffroles}
            >
              <option value="">Pilih</option>
              <option value="PENJADWALAN">Penjadwalan</option>
              <option value="ACCOUNTING">Akutansi</option>
              <option value="PENILAIAN">Penilaian</option>
            </select>
            {errors.staffrole?.message && (
              <p className="text-xs text-red-400">
                {errors.staffrole.message.toString()}
              </p>
            )}
          </div>
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
              ? "Tambah Staff"
              : "Update Staff"}
          </button>
        </div>
      </form>
      {showConfirm && (
        <ConfirmDialog
          message={type === "create" ? "Tambah Staff baru?" : "Ubah Staff?"}
          onConfirm={handleSubmitForm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {showActivateDialog && (
        <ConfirmDialog
          message={state.message || "Aktifkan Akun?"}
          onConfirm={async () => {
            clearErrors();
            // Call a new server action to activate/create the Clerk user
            const result = await activateManyTeachers([pendingData.id], true); // ✅ pass as array
            const failed = result.failed?.[0]; // only one expected
            if (result.success) {
              toast.success(result.message);
              setTimeout(
                () => router.push(`/list/teachers/${result.id}`),
                3000
              );
            } else if (failed) {
              if (failed.field) {
                setError(failed.field as any, { message: failed.message });
              }
              toast.error(
                `${failed.field ? `${failed.field}: ` : ""}${failed.message}`
              );
            } else {
              toast.error(result.message || "Terjadi kesalahan.");
            }
            setShowActivateDialog(false);
            setOpen(false);
            // router.refresh();
          }}
          onCancel={async () => {
            clearErrors();
            setWithUser(false);
            formAction({
              ...pendingData,
              img: img?.secure_url,
              withUser: false, // tell server to skip Clerk
            });
            setShowActivateDialog(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
};
export default StaffForm;
