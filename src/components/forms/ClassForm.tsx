"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";

const schema = z.object({
  class: z.string().min(2, { message: "Kelas wajib diisi!" }),
  capacity: z.number().min(2, { message: "Kapasitas kelas wajib diisi!" }),
  grade: z.string().max(1, { message: "Tingkat kelas wajib diisi!" }),
  supervisor: z.string().min(1, { message: "Guru Kelas diisi!" }),
});

type Inputs = z.infer<typeof schema>;

const ClassForm = ({
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
      <h1 className="text-xl font-semibold">Tambah Kelas Baru</h1>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Kelas
      </span>
      <div className="flex justify-between flex-wrap gap-4 m-4 mb-8">
        <InputField
          label="Kelas"
          name="class"
          defaultValue={data?.class}
          register={register}
          error={errors?.class}
        ></InputField>
        <InputField
          label="Kapasitas"
          name="capacity"
          defaultValue={data?.capacity}
          register={register}
          error={errors?.capacity}
        ></InputField>
        <InputField
          label="Supervisor"
          name="date"
          defaultValue={data?.supervisor}
          register={register}
          error={errors?.supervisor}
        ></InputField>
      </div>

      <button>{type === "create" ? "Create" : "Update"}</button>
    </form>
  );
};

export default ClassForm;
