"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchema";
import { createMeeting, CurrentState } from "@/lib/actions";
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
    trigger,
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<AttendanceSchema | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  useEffect(() => {
    if (state.success) {
      toast(`Pertemuan telah berhasil ditambah!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, setOpen, router]);

  // Fungsi submit sesungguhnya setelah konfirmasi
  const submitForm = () => {
    if (!formData) return;
    setIsSubmitting(true);
    startTransition(() => {
      formAction(formData);
    });
    setShowConfirm(false);
  };

  // Tombol submit di form: trigger validasi, kalau valid simpan data dan tampilkan konfirmasi
  const onSubmit = async () => {
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

  return (
    <>
      <form
        action=""
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
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
          />
          <InputField
            label="Banyak Pertemuan"
            name="meetingCount"
            type="number"
            defaultValue={data?.meetingCount}
            register={register}
            placeholder="Angka 1-30"
            error={errors?.meetingCount}
          />
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
            {isSubmitting ? "Memproses..." : "Tambah Pertemuan"}
          </button>
        </div>
      </form>

      {showConfirm && formData && (
        <ConfirmDialog
          message={`Apakah Anda yakin ingin menambahkan pertemuan ke-${formData.meetingCount}?`}
          onConfirm={submitForm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default MeetingForm;
