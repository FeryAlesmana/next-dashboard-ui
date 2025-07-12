"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import { parentSchema, ParentSchema } from "@/lib/formValidationSchema";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createParent, CurrentState, updateParent } from "@/lib/actions";
import { toast } from "react-toastify";
import Select from "react-select";

const ParentForm = ({
  setOpen,
  type,
  data,
  relatedData,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
  });
  const createParentHandler = async (
    prevState: CurrentState,
    payload: ParentSchema
  ): Promise<CurrentState> => {
    return await createParent(prevState, payload);
  };

  const updateParentHandler = async (
    prevState: CurrentState,
    payload: ParentSchema
  ): Promise<CurrentState> => {
    return await updateParent(prevState, payload);
  };

  const [state, formAction] = useActionState(
    type === "create" ? createParentHandler : updateParentHandler,
    {
      success: false,
      error: false,
      message: "",
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
        `Orang tua telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { students = [] } = relatedData ?? {};

  const studentOptions = students.map(
    (student: { id: string; name: string; surname: string }) => ({
      value: student.id,
      label: `${student.name} ${student.surname}`,
    })
  );

  return (
    <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Tambah Orang tua Baru</h1>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Autentikasi
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        ></InputField>
        <InputField
          label="Email"
          name="email"
          type="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        ></InputField>
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        ></InputField>
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Personal
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Nama depan"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        ></InputField>
        <InputField
          label="Nama Belakang"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors?.surname}
        ></InputField>
        <InputField
          label="No. Telepon"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors?.phone}
        ></InputField>
        <InputField
          label="Alamat"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors?.address}
        ></InputField>
        <InputField
          label="Pekerjaan"
          name="job"
          defaultValue={data?.job}
          register={register}
          error={errors?.job}
        ></InputField>
        <InputField
          label="Penghasilan"
          name="income"
          defaultValue={data?.income}
          register={register}
          error={errors?.income}
        ></InputField>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Pendidikan</label>
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
          <label className="text-xs text-gray-400">Siswa</label>

          <Controller
            name="students"
            control={control}
            defaultValue={
              data?.students?.map((student: { id: string }) => student.id) || []
            }
            render={({ field }) => {
              const selectedValues = studentOptions.filter(
                (opt: { value: string; label: string }) =>
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
            ? "Tambah Orang Tua"
            : "Update dan Simpan"}
        </button>
      </div>
    </form>
  );
};

export default ParentForm;
