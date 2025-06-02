"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const schema = z.object({
  event: z.string().min(4, { message: "Kelas wajib diisi!" }),
  class: z.string().min(2, { message: "Kelas wajib diisi!" }),
  date: z.string().min(2, { message: "Tannggal event wajib diisi!" }),
  startTime: z.string().min(1, { message: "Waktu mulai event wajib diisi!" }),
  endTime: z.string().min(1, { message: "Waktu ahir event wajib diisi!" }),
});

type Inputs = z.infer<typeof schema>;

const EventsForm = ({
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
      <h1 className="text-xl font-semibold">Tambah Acara Baru</h1>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Acara
      </span>
      <div className="flex justify-between flex-wrap gap-4 m-4 mb-8">
        <InputField
          label="Nama Event"
          name="event"
          defaultValue={data?.event}
          register={register}
          error={errors?.event}
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
      <div className="flex justify-evenly flex-wrap gap-4 m-4 mb-8">
        <InputField
          label="Waktu mulai"
          name="startTime"
          defaultValue={data?.startTime}
          register={register}
          error={errors?.startTime}
        ></InputField>
        <InputField
          label="Waktu berakhir"
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

export default EventsForm;
