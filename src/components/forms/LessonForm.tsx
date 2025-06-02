"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";

const schema = z.object({
  lesson: z.string().min(3, { message: "Pelajaran wajib diisi" }),
  class: z.string().min(2, { message: "Kelas wajib diisi!" }),
  teacher: z.string().min(1, { message: "Tanggal wajib diisi!" }),
});

type Inputs = z.infer<typeof schema>;

const LessonForm = ({
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
      <h1 className="text-xl font-semibold">Tambah Pelajaran Baru</h1>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Pelajaran
      </span>
      <div className="flex justify-between flex-wrap gap-4 m-4">
        <InputField
          label="Pelajaran"
          name="lesson"
          defaultValue={data?.lesson}
          register={register}
          error={errors?.lesson}
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
      </div>

      <button>{type === "create" ? "Create" : "Update"}</button>
    </form>
  );
};

export default LessonForm;
