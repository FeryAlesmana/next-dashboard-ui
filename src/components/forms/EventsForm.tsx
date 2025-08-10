"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { eventSchema, EventSchema } from "@/lib/formValidationSchema";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createEvent, CurrentState, updateEvent } from "@/lib/actions";

const ConfirmDialog = ({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
      <p className="text-sm text-gray-700">{message}</p>
      <div className="flex justify-end gap-2 mt-6">
        <button
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          onClick={onCancel}
        >
          Tidak
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onConfirm}
        >
          Ya
        </button>
      </div>
    </div>
  </div>
);

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
    trigger,
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
    { success: false, error: false }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<EventSchema | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  // Submit akhir setelah konfirmasi dialog
  const submitForm = () => {
    if (!formData) return;
    setIsSubmitting(true);
    startTransition(() => {
      formAction(formData);
    });
    setShowConfirm(false);
  };

  // Handle submit form: validasi dulu, jika valid baru simpan data & tampilkan dialog konfirmasi
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await trigger();
    if (valid) {
      handleSubmit((data) => {
        setFormData(data);
        setShowConfirm(true);
      })();
    } else {
      setShowConfirm(false);
    }
  };

  const { classes } = relatedData;
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <>
      <form
        action=""
        className="flex flex-col gap-8"
        onSubmit={onSubmit}
      >
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
          />
          <InputField
            label="Deskripsi"
            name="description"
            defaultValue={data?.description}
            register={register}
            error={errors?.description}
            type="textarea"
          />
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
              <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>
            )}
          </div>
        </div>
        <div className="flex justify-evenly flex-wrap gap-4 m-4 mb-8">
          <InputField
            label="Waktu mulai"
            name="startTime"
            defaultValue={data?.startTime ? formatDateForInput(data.startTime) : ""}
            register={register}
            error={errors?.startTime}
            type="datetime-local"
          />
          <InputField
            label="Waktu berakhir"
            name="endTime"
            defaultValue={data?.endTime ? formatDateForInput(data.endTime) : ""}
            register={register}
            error={errors?.endTime}
            type="datetime-local"
          />
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
              ? "Tambah Event"
              : "Update dan Simpan"}
          </button>
        </div>
      </form>

      {showConfirm && (
        <ConfirmDialog
          message={type === "create" ? "Tambah Event baru?" : "Simpan perubahan Event?"}
          onConfirm={submitForm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default EventsForm;
