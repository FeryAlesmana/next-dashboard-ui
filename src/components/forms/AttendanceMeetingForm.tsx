"use client";
import { FieldError, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchema";
import { useRouter } from "next/navigation";
import { CurrentState, updateAttendance } from "@/lib/actions";
import { AttendanceStatus } from "@/lib/formValidationSchema";

export type AttendanceData = Record<string, { status: AttendanceStatus }>;

type AttendanceMeetingFormProps = {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
  relatedData?: { students: any[]; lessons?: any[] };
};

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
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
}

const AttendanceMeetingForm = ({
  setOpen,
  type,
  data,
  relatedData,
}: AttendanceMeetingFormProps) => {
  const { students = [], lessons = [] } = relatedData || {};
  const attendanceData = (data?.attendance || {}) as AttendanceData;

  const statuses: AttendanceStatus[] = ["HADIR", "SAKIT", "ABSEN"];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<AttendanceSchema | null>(null);

  const {
    register,
    reset,
    setValue,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      meetingId: data?.meetingId,
      lessonId: data?.lessonId,
      date: data?.date ? new Date(data.date) : undefined,
      startTime: data?.startTime,
      endTime: data?.endTime,
      attendance: data?.attendance
        ? Object.keys(data.attendance).reduce((acc, studentId) => {
            acc[studentId] = {
              status: data.attendance[studentId]?.status || "HADIR",
            };
            return acc;
          }, {} as AttendanceData)
        : students.reduce((acc, s) => {
            acc[s.id] = { status: "HADIR" };
            return acc;
          }, {} as AttendanceData),
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        meetingId: data.meetingId,
        lessonId: data.lessonId,
        date: data.date ? new Date(data.date) : undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        attendance: data?.attendance
          ? Object.keys(data.attendance).reduce((acc, studentId) => {
              acc[studentId] = {
                status: data.attendance[studentId]?.status || "HADIR",
              };
              return acc;
            }, {} as AttendanceData)
          : students.reduce((acc, s) => {
              acc[s.id] = { status: "HADIR" };
              return acc;
            }, {} as AttendanceData),
      });
    }
  }, [data, reset, students]);

  const currentLesson = lessons?.find(
    (lesson) => lesson.id === Number(data?.lessonId)
  );

  const updateMeetingHandler = async (
    prevState: CurrentState,
    payload: AttendanceSchema
  ): Promise<CurrentState> => {
    return await updateAttendance(prevState, payload);
  };
  const [state, formAction] = useActionState(updateMeetingHandler, {
    success: false,
    error: false,
    message: "",
  });

  // Submit form handler yang hanya tampilkan confirm jika valid
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

  // Fungsi submit akhir saat konfirmasi "Ya"
  const handleConfirmSubmit = () => {
    if (formData) {
      setIsSubmitting(true);
      startTransition(() => {
        formAction(formData);
      });
    }
    setShowConfirm(false);
  };

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Presensi berhasil di ${
          type === "create" ? "Tambah!" : "Edit!"
        }`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        <h1 className="text-xl font-semibold">
          Presensi Pertemuan-{data?.meetingId}
        </h1>
        {currentLesson && (
          <div className="text-lg font-medium text-gray-700">
            {`Pelajaran: ${currentLesson.name}`}
          </div>
        )}
        <div className="grid gap-4">
          {students.length > 0 && students[0].class?.name && (
            <div className="text-lg font-medium text-gray-700">
              Kelas: {students[0].class.name}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">No.</th>
                  <th className="border px-4 py-2">Nama Siswa</th>
                  <th className="border px-4 py-2">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} className="odd:bg-white even:bg-gray-50">
                    <td className="border px-4 py-2 text-center">{index + 1}</td>
                    <td className="border px-4 py-2">{student.name}</td>
                    <td className="border px-4 py-2">
                      <div className="flex justify-center gap-4">
                        {statuses.map((status) => (
                          <label key={status} className="flex items-center gap-1">
                            <input
                              type="radio"
                              value={status}
                              {...register(`attendance.${student.id}.status`)}
                              defaultChecked={
                                attendanceData?.[student.id]?.status === status
                              }
                            />
                            {status.charAt(0).toUpperCase() +
                              status.slice(1).toLowerCase()}
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => {
            students.forEach((s) =>
              setValue(`attendance.${s.id}.status`, "HADIR")
            );
          }}
        >
          Set Semua ke Hadir
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Presensi"}
        </button>

        {Object.values(errors).map((err, idx) => (
          <div key={idx} className="text-red-500 text-sm">
            {typeof err === "object" && "message" in err
              ? (err as FieldError).message
              : null}
          </div>
        ))}
      </form>

      {showConfirm && (
        <ConfirmDialog
          message={type === "create" ? "Tambah presensi baru?" : "Simpan perubahan presensi?"}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default AttendanceMeetingForm;
