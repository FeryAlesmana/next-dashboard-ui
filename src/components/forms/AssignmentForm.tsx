"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";

const schema = z.object({
  judul: z
    .string()
    .min(3, { message: "judul harus lebih dari 3 karakter!" })
    .max(20, { message: "judul harus kurang dari 20 karakter!" }),
  class: z.string().min(2, { message: "Nama Kelas wajib diisi!" }),
  teacher: z.string().min(8, { message: "Nama guru wajib diisi!" }),
  dueDate: z.string().min(1, { message: "Tanggal wajib diisi!" }),
});

type Inputs = z.infer<typeof schema>;

const AssignmentForm = ({
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
      <h1 className="text-xl font-semibold">Tambah Pemberitahuan Baru</h1>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Autentikasi
      </span>
      <div className="flex justify-between flex-wrap gap-4 m-4">
        <InputField
          label="Judul"
          name="judul"
          defaultValue={data?.judul}
          register={register}
          error={errors?.judul}
        ></InputField>
        <InputField
          label="Kelas"
          name="class"
          defaultValue={data?.class}
          register={register}
          error={errors?.class}
        ></InputField>
        <InputField
          label="Guru"
          name="teacher"
          defaultValue={data?.teacher}
          register={register}
          error={errors?.teacher}
        ></InputField>
        <InputField
          label="Deadline"
          name="dueDate"
          type="date"
          defaultValue={data?.dueDate}
          register={register}
          error={errors?.dueDate}
        ></InputField>
      </div>

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AssignmentForm;
