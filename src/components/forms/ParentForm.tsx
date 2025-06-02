"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";

const schema = z.object({
  username: z
    .string()
    .min(3, { message: "Username harus lebih dari 3 karakter!" })
    .max(20, { message: "Username harus kurang dari 20 karakter!" }),
  email: z.string().email({ message: "Email anda Tidak valid!" }),
  password: z
    .string()
    .min(8, { message: "Password harus mempunyai 8 karakter!" }),
  firstName: z.string().min(1, { message: "Nama depan wajib diisi!" }),
  lastName: z.string().min(1, { message: "Nama belakang wajib diisi!" }),
  student: z.string().min(1, { message: "Nama murid wajib diisi!" }),
  phone: z.string().min(1, { message: "Nomor telepon wajib diisi!" }),
  sex: z.enum(["male", "female"], { message: "Jenis Kelamin wajib diisi!" }),
  address: z.string().min(1, { message: "Alamat wajib diisi!" }),
});

type Inputs = z.infer<typeof schema>;

const ParentForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

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
          name="firstName"
          defaultValue={data?.firstName}
          register={register}
          error={errors?.firstName}
        ></InputField>
        <InputField
          label="Nama Belakang"
          name="lastName"
          defaultValue={data?.lastName}
          register={register}
          error={errors?.lastName}
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
          label="Nama Murid"
          name="student"
          defaultValue={data?.student}
          register={register}
          error={errors?.student}
        ></InputField>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Jenis Kelamin</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="male">Lelaki</option>
            <option value="female">Perempuan</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
      </div>
      <button>{type === "create" ? "Create" : "Update"}</button>
    </form>
  );
};

export default ParentForm;
