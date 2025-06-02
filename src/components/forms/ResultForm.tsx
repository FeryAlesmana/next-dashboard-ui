"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const schema = z.object({
  subject: z.string().min(4, { message: "Nama Mata Pelajaran wajib diisi!" }),
  student: z.string().min(1, { message: "Nama murid wajib diisi!" }),
  result: z.number().min(1, { message: "Nilai murid wajib diisi!" }),
  class: z.string().min(2, { message: "Nama Kelas wajib diisi!" }),
  teacher: z.string().min(2, { message: "Nama Guru wajib diisi!" }),
  date: z.string().min(2, { message: "Tannggal event wajib diisi!" }),
  startTime: z.string().min(1, { message: "Waktu mulai event wajib diisi!" }),
  endTime: z.string().min(1, { message: "Waktu selesai event wajib diisi!" }),
});

type Inputs = z.infer<typeof schema>;

const ResultForm = ({
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
      <h1 className="text-xl font-semibold">Tambah Nilai Baru</h1>
      <span className="text-xs text-gray-400 font-medium">Informasi Nilai</span>
      <div className="flex justify-between flex-wrap gap-10 m-4 mb-8">
        <InputField
          label="Nama Ujian"
          name="subject"
          defaultValue={data?.subject}
          register={register}
          error={errors?.subject}
        ></InputField>
        <InputField
          label="Nama Murid"
          name="student"
          defaultValue={data?.student}
          register={register}
          error={errors?.student}
        ></InputField>
        <InputField
          label="Nilai"
          name="result"
          defaultValue={data?.result}
          register={register}
          error={errors?.result}
        ></InputField>
        <InputField
          label="Guru"
          name="teacher"
          defaultValue={data?.teacher}
          register={register}
          error={errors?.teacher}
        ></InputField>
        <InputField
          label="Kelas"
          name="class"
          defaultValue={data?.class}
          register={register}
          error={errors?.class}
        ></InputField>
        <InputField
          label="Tanggal"
          name="date"
          type="date"
          defaultValue={data?.date}
          register={register}
          error={errors?.date}
        ></InputField>
      </div>

      <button>{type === "create" ? "Create" : "Update"}</button>
    </form>
  );
};

export default ResultForm;
