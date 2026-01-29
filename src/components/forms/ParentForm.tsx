"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  CreateparentSchema,
  createParentSchema,
  updateParentSchema,
  UpdateparentSchema,
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
import {
  activateManyParents,
  createParent,
  CurrentState,
  updateParent,
} from "@/lib/actions";
import { toast } from "react-toastify";
import Select from "react-select";
import z from "zod";
import ConfirmDialog from "../ConfirmDialog";
import { BaseFormProps } from "./AssignmentForm";

const ParentForm = ({
  setOpen,
  type,
  data,
  relatedData,
  onChanged,
}: BaseFormProps) => {
  const schema = type === "create" ? createParentSchema : updateParentSchema;
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
    getValues,
    trigger,
    setError,
    clearErrors,
  } = useForm<
    typeof schema extends z.ZodTypeAny ? z.infer<typeof schema> : never
  >({
    resolver: zodResolver(schema),
  });

  const createParentHandler = async (
    prevState: CurrentState,
    payload: CreateparentSchema
  ): Promise<CurrentState> => {
    return await createParent(prevState, payload);
  };

  const updateParentHandler = async (
    prevState: CurrentState,
    payload: UpdateparentSchema
  ): Promise<CurrentState> => {
    return await updateParent(prevState, payload);
  };

  const [state, formAction] = useActionState(
    type === "create" ? createParentHandler : updateParentHandler,
    {
      success: false,
      error: false,
      message: "",
      field: "",
      code: "",
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const [withUser, setWithUser] = useState(true); // default: true (Clerk enabled)
  const selectedSex = watch("sex");

  const router = useRouter();

  useEffect(() => {
    if (!state.success && state.error) {
      if (state.field) {
        setError(state.field as any, { message: state.message });
      } else if (state.code === "USER_NOT_FOUND") {
        setShowActivateDialog(true);
        setPendingData(getValues()); // store form data for retry
      } else {
        // General (non-field) error
        // router.refresh();
        toast.error(state.message || "Terjadi kesalahan.");
      }
    }
    setIsSubmitting(false);
  }, [state, setError, getValues]);

  // Submit final setelah konfirmasi
  const handleSubmitForm = handleSubmit(async (data) => {
    setIsSubmitting(true);
    const payload: any = { ...data, withUser };
    try {
      startTransition(() => {
        formAction(payload);
      }); // ✅ wait for server action
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  });

  // Submit awal: validasi → kalau valid munculkan dialog
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await trigger();
    if (valid) {
      // Ambil data form jika valid dan tampilkan dialog konfirmasi
      setShowConfirm(true);
    } else {
      setShowConfirm(false);
    }
  };

  useEffect(() => {
    if (type === "update" && data?.students) {
      const mergedStudentIds = [
        ...(data.students?.map((s: { id: string }) => s.id) || []),
        ...(data.secondaryStudents?.map((s: { id: string }) => s.id) || []),
        ...(data.guardianStudents?.map((s: { id: string }) => s.id) || []),
      ];
      reset({
        ...data,
        birthday: data?.birthday
          ? new Date(data.birthday).toISOString().split("T")[0]
          : "",
        students: mergedStudentIds,
      });
    }
    if (state.success) {
      const updatedItem = state.data ?? data;
      toast(
        `Wali Murid telah berhasil di ${
          type === "create" ? "Tambah!" : "Edit!"
        }`
      );
      if (onChanged && updatedItem) {
        onChanged(updatedItem); // 🔥 notify parent so it can update localData
      } else {
        router.refresh(); // fallback if no handler passed
      }
      setOpen(false);
      if (type === "create") {
        setTimeout(() => router.push(`/list/parents?id=${state.id}`), 3000);
      }
    }
  }, [state, type, setOpen, router, data, reset, onChanged]);

  const { students = [] } = relatedData ?? {};
  const studentOptions = students.map(
    (student: { id: string; name: string }) => ({
      value: student.id,
      label: `${student.name} `,
    })
  );
  const [showPassword, setShowPassword] = useState(false);

  // console.log(data, "data in parentForm");
  return (
    <>
      <form className="flex flex-col gap-8 " onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Tambah Wali Murid baru" : "Edit Wali Murid"}
        </h1>
        <span className="text-xs text-gray-600 font-medium">
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
              table="parent"
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
              table="parent"
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
              table="parent"
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

        <span className="text-xs text-gray-600 font-medium">
          Informasi Personal
        </span>
        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="Nama lengkap"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
          />
          <InputField
            label="Birthday"
            name="birthday"
            type="date"
            register={register}
            error={errors?.birthday}
          />
          <InputField
            label="No. Telepon"
            name="phone"
            defaultValue={data?.phone}
            register={register}
            error={errors?.phone}
            placeholder="10-13 digit"
          />
          <InputField
            label="Alamat"
            name="address"
            defaultValue={data?.address}
            register={register}
            error={errors?.address}
            placeholder="Contoh: Jl. Menanam No. 37, RT. 02/05, Kelurahan Curug, Kecamatan Bojongsari"
          />
          <InputField
            label="Pekerjaan"
            name="job"
            defaultValue={data?.job}
            register={register}
            error={errors?.job}
            placeholder="Masukkan pekerjaan"
          />
          <InputField
            label="Penghasilan"
            name="income"
            defaultValue={data?.income}
            register={register}
            error={errors?.income}
            placeholder="Contoh: 5.200.000"
          />
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-600">Jenis Kelamin</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("sex")}
              defaultValue={data?.sex}
            >
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
            {errors.sex?.message && (
              <p className="text-xs text-red-400">
                {errors.sex.message.toString()}
              </p>
            )}
          </div>
          {/* Wali Murid */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-600">Wali Murid</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("waliMurid")}
              defaultValue={data?.waliMurid}
            >
              <option value="">Pilih Wali</option>
              {selectedSex !== "FEMALE" && <option value="AYAH">Ayah</option>}
              {selectedSex !== "MALE" && <option value="IBU">Ibu</option>}
              <option value="WALI">Wali</option>
            </select>
            {errors.waliMurid?.message && (
              <p className="text-xs text-red-400">
                {errors.waliMurid.message.toString()}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-600">Pendidikan</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("degree")}
              defaultValue={data?.degree}
            >
              <option value="">-- Pilih --</option>
              <option value="TIDAK_ADA">Tidak Ada</option>
              <option value="SD">SD/Sederajat</option>
              <option value="SMP">SMP/Sederajat</option>
              <option value="SMA">SMA/Sederajat</option>
              <option value="D3">D3</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
            </select>
            {errors.degree?.message && (
              <p className="text-xs text-red-400">
                {errors.degree.message.toString()}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-600">Siswa</label>

            <Controller
              name="students"
              control={control}
              defaultValue={
                data?.students?.map((student: { id: string }) => student.id) ||
                []
              }
              render={({ field }) => {
                const selectedValues = studentOptions.filter((opt: any) =>
                  field.value?.includes(opt.value)
                );

                return (
                  <Select
                    {...field}
                    isMulti
                    options={studentOptions}
                    className="text-sm"
                    classNamePrefix="select"
                    placeholder="Cari siswa..."
                    value={selectedValues}
                    onChange={(selectedOptions) => {
                      field.onChange(selectedOptions.map((opt) => opt.value));
                    }}
                  />
                );
              }}
            />

            {errors.students?.message && (
              <p className="text-xs text-red-400">
                {errors.students.message.toString()}
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
              ? "Tambah Wali Murid"
              : "Update dan Simpan"}
          </button>
        </div>
      </form>

      {showConfirm && (
        <ConfirmDialog
          message={
            type === "create"
              ? "Tambah data Wali Murid baru?"
              : "Simpan perubahan data Wali Murid?"
          }
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
            const result = await activateManyParents([pendingData.id], true); // ✅ pass as array
            const failed = result.failed?.[0]; // only one expected
            if (result.success) {
              toast.success(result.message);
              setTimeout(
                () => router.push(`/list/parents?id=${result.id}`),
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
            // setOpen(false);
            // router.refresh();
          }}
          onCancel={async () => {
            clearErrors();
            setWithUser(false);
            formAction({
              ...pendingData,
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

export default ParentForm;
