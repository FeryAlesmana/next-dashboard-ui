"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  attendanceSchema,
  AttendanceSchema,
  subjectSchema,
  SubjectSchema,
} from "@/lib/formValidationSchema";
import {
  createMeeting,
  createSubject,
  CurrentState,
  updateSubject,
} from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Select from "react-select";

const MeetingForm = ({
  setOpen,
  type,
  data,
  lessonId,
  relatedData,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create";
  data?: any;
  lessonId?: string;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
  });
  const createMeetingHandler = async (
    prevState: CurrentState,
    payload: AttendanceSchema
  ): Promise<CurrentState> => {
    return await createMeeting(prevState, payload);
  };

  const [state, formAction] = useActionState(createMeetingHandler, {
    success: false,
    error: false,
    message: "",
  });
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
      toast(`Pertemuan telah berhasil di Tambah!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { lessons = [] } = relatedData || {};

  return (
    <form action="" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Tambah Pertemuan Baru</h1>
      <div className="flex justify-between flex-wrap gap-4 p-4">
        <InputField
          label="lessonId"
          name="lessonId"
          type="number"
          defaultValue={lessonId}
          register={register}
          error={errors?.lessonId}
          hidden
        ></InputField>
        <InputField
          label="Banyak Pertemuan"
          name="meetingCount"
          type="number"
          defaultValue={data?.meetingCount}
          register={register}
          placeholder="Angka 1-30"
          error={errors?.meetingCount}
        ></InputField>
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
            ? "Tambah Pertemuan"
            : "Update dan Simpan"}
        </button>
      </div>
    </form>
  );
};

export default MeetingForm;
