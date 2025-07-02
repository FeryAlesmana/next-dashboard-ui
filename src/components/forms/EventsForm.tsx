"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { eventSchema, EventSchema } from "@/lib/formValidationSchema";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createEvent, CurrentState, updateEvent } from "@/lib/actions";

const EventsForm = ({
  setOpen,
  type,
  data,
  relatedData,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
  relatedData: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
  });
  const createEventHandler = async (
    prevState: CurrentState,
    payload: EventSchema
  ): Promise<CurrentState> => {
    return await createEvent(prevState, payload);
  };

  const updateEventHandler = async (
    prevState: CurrentState,
    payload: EventSchema
  ): Promise<CurrentState> => {
    return await updateEvent(prevState, payload);
  };

  const [state, formAction] = useActionState(
    type === "create" ? createEventHandler : updateEventHandler,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    startTransition(() => {
      formAction(data);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Event telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { classes } = relatedData;
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // returns "YYYY-MM-DDTHH:MM"
  };

  return (
    <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tambah Acara baru" : "Edit Acara"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">Informasi Acara</span>
      <div className="flex justify-between flex-wrap gap-4 m-4 mb-8">
        <InputField
          label="Nama Event"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        ></InputField>
        <InputField
          label="Deskripsi"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
          type="textarea"
        ></InputField>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Kelas</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId}
          >
            {classes.map((kelas: { id: number; name: string }) => (
              <option value={kelas.id} key={kelas.id}>
                {kelas.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-evenly flex-wrap gap-4 m-4 mb-8">
        <InputField
          label="Waktu mulai"
          name="startTime"
          defaultValue={
            data?.startTime ? formatDateForInput(data.startTime) : ""
          }
          register={register}
          error={errors?.startTime}
          type="datetime-local"
        ></InputField>
        <InputField
          label="Waktu berakhir"
          name="endTime"
          defaultValue={data?.endTime ? formatDateForInput(data.endTime) : ""}
          register={register}
          error={errors?.endTime}
          type="datetime-local"
        ></InputField>
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

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default EventsForm;
