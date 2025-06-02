"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const schema = z.object({
  exam: z.string().min(4, { message: "Nama Ujian wajib diisi!" }),
  class: z.string().min(2, { message: "Nama Kelas wajib diisi!" }),
  teacher: z.string().min(2, { message: "Nama Guru wajib diisi!" }),
  date: z.string().min(2, { message: "Tannggal event wajib diisi!" }),
  startTime: z.string().min(1, { message: "Waktu mulai event wajib diisi!" }),
  endTime: z.string().min(1, { message: "Waktu selesai event wajib diisi!" }),
});

type Inputs = z.infer<typeof schema>;

const ExamForm = ({
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
      <h1 className="text-xl font-semibold">Tambah Ujian Baru</h1>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Ujian
      </span>
      <div className="flex justify-between flex-wrap gap-10 m-4 mb-8">
        <InputField
          label="Nama Ujian"
          name="exam"
          defaultValue={data?.exam}
          register={register}
          error={errors?.exam}
        ></InputField>
        <InputField
          label="Kelas"
          name="class"
          defaultValue={data?.class}
          register={register}
          error={errors?.class}
        ></InputField>
        <InputField
          label="Guru/Pengawas"
          name="teacher"
          defaultValue={data?.teacher}
          register={register}
          error={errors?.teacher}
        ></InputField>
        <InputField
          label="Tanggal"
          name="date"
          type="date"
          defaultValue={data?.date}
          register={register}
          error={errors?.date}
        ></InputField>
        <InputField
          label="Waktu mulai"
          name="startTime"
          defaultValue={data?.startTime}
          register={register}
          error={errors?.startTime}
        ></InputField>
        <InputField
          label="Waktu selesai"
          name="endTime"
          defaultValue={data?.endTime}
          register={register}
          error={errors?.endTime}
        ></InputField>
      </div>

      <button>{type === "create" ? "Create" : "Update"}</button>
    </form>
  );
};

export default ExamForm;
