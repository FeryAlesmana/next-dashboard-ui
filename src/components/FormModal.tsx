"use client";

import {
  CurrentState,
  deleteAnnouncement,
  deleteAssignment,
  deleteAssignments,
  deleteAttendance,
  deleteClass,
  deleteClasses,
  deleteEvent,
  deleteExam,
  deleteExams,
  deleteFacility,
  deleteLesson,
  deleteLessons,
  deleteManyUsers,
  deleteParent,
  deleteParents,
  deletePaymentLog,
  deletePaymentLogs,
  deletePerfomance,
  deletePpdb,
  deletePPDBs,
  deleteResult,
  deleteResults,
  deleteStaff,
  deleteStaffs,
  deleteStudent,
  deleteStudents,
  deleteSubject,
  deleteSubjects,
  deleteTeacher,
  deleteTeachers,
  deleteUser,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import DeleteManyForm from "./forms/DeleteMany";
import UpdateManyStudentsForm from "./forms/UpdateManyStudents";
import UpdateManyPaymentsForm from "./forms/UpdateManyPaymentForm";
import UpdateManyTeacherForm from "./forms/UpdateManyTeacher";
import UpdateManyParentForm from "./forms/UpdateManyParents";
import UpdateManyResultsForm from "./forms/UpdateManyResultsForm";
import UpdateManyAssignmentsForm from "./forms/UpdateManyAssignments";
import UpdateManyExamsForm from "./forms/UpdateManyExams";
import ImportTeachersForm from "./forms/ImportTeachersForm";
import ImportStudentsForm from "./forms/ImportStudentForm";
import ActivateAccountForm from "./forms/ActivateAccountForm";
import ImportPaymentsForm from "./forms/ImportPaymentsForm";
import ExportPaymentsForm from "./forms/ExportPaymentsForm";
import { createPortal } from "react-dom";
import ExportResultsForm from "./forms/ExportResultsForm";
import PerformanceForm from "./forms/PerfomanceForm";
// import StudentForm from "./forms/StudentForm";
// import TeacherForm from "./forms/TeacherForm";

const deleteActionMap = {
  student: deleteStudent,
  teacher: deleteTeacher,
  parent: deleteParent,
  class: deleteClass,
  subject: deleteSubject,
  lesson: deleteLesson,
  exam: deleteExam,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteAttendance,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  ppdb: deletePpdb,
  paymentLog: deletePaymentLog,
  bill: deletePaymentLog,
  user: deleteUser,
  staff: deleteStaff,
  staffPerfomance: deletePerfomance,
  facilities: deleteFacility,
};

const singleDeleteMap = {
  student: deleteStudent,
  teacher: deleteTeacher,
  parent: deleteParent,
  class: deleteClass,
  subject: deleteSubject,
  lesson: deleteLesson,
  exam: deleteExam,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteAttendance,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  ppdb: deletePpdb,
  paymentLog: deletePaymentLog,
  bill: deletePaymentLog,
  user: deleteUser,
  staff: deleteStaff,
  staffPerfomance: deletePerfomance,
  facilities: deleteFacility,
};

const bulkDeleteMap = {
  student: deleteStudents,
  teacher: deleteTeachers,
  parent: deleteParents,
  class: deleteClasses,
  subject: deleteSubjects,
  lesson: deleteLessons,
  exam: deleteExams,
  assignment: deleteAssignments,
  result: deleteResults,
  attendance: deleteStudents,
  event: deleteStudents,
  announcement: deleteStudents,
  ppdb: deletePPDBs,
  paymentLog: deletePaymentLogs,
  bill: deletePaymentLogs,
  user: deleteManyUsers,
  staff: deleteStaffs,
  staffPerfomance: deletePPDBs,
  facilities: deletePPDBs,
};

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StaffForm = dynamic(() => import("./forms/StaffForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const EventsForm = dynamic(() => import("./forms/EventsForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const FormulirPendaftaran = dynamic(
  () => import("./forms/FormulirPendaftaran"),
  {
    loading: () => <h1>Loading...</h1>,
  },
);
const AttendanceMeetingForm = dynamic(
  () => import("./forms/AttendanceMeetingForm"),
  {
    loading: () => <h1>Loading...</h1>,
  },
);
const MeetingForm = dynamic(() => import("./forms/MeetingForm"), {
  loading: () => <h1>Loading...</h1>,
});
const PaymentForm = dynamic(() => import("./forms/PaymentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const NewPaymentForm = dynamic(() => import("./forms/NewPaymentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const BillForm = dynamic(() => import("./forms/BillForm"), {
  loading: () => <h1>Loading...</h1>,
});
const UserForm = dynamic(() => import("./forms/UserForm"), {
  loading: () => <h1>Loading...</h1>,
});
const FacilitiesForm = dynamic(() => import("./forms/FacilitesForm"), {
  loading: () => <h1>Loading...</h1>,
});
const PPDBSettingForm = dynamic(() => import("./forms/PPDBSettingForm"), {
  loading: () => <h1>Loading...</h1>,
});

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any,
    onChanged?: (item: any) => void,
    role?: string,
    lessonId?: string,
  ) => JSX.Element;
} = {
  teacher: (setOpen, type, data, relatedData, onChanged) => (
    <TeacherForm
      setOpen={setOpen}
      type={type}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  staff: (setOpen, type, data, relatedData, onChanged) => (
    <StaffForm
      setOpen={setOpen}
      type={type}
      data={data}
      onChanged={onChanged}
    />
  ),
  student: (setOpen, type, data, relatedData, onChanged) => (
    <StudentForm
      setOpen={setOpen}
      type={type}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  subject: (setOpen, type, data, relatedData, onChanged) => (
    <SubjectForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  class: (setOpen, type, data, relatedData, onChanged) => (
    <ClassForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementForm
      setOpen={setOpen}
      type={type}
      data={data}
      relatedData={relatedData}
    />
  ),
  assignment: (setOpen, type, data, relatedData, onChanged) => (
    <AssignmentForm
      setOpen={setOpen}
      type={type}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  event: (setOpen, type, data, relatedData) => (
    <EventsForm
      setOpen={setOpen}
      type={type}
      data={data}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData, onChanged) => (
    <ExamForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  lesson: (setOpen, type, data, relatedData, onChanged) => (
    <LessonForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  parent: (setOpen, type, data, relatedData, onChanged) => (
    <ParentForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  result: (setOpen, type, data, relatedData, onChanged) => (
    <ResultForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  ppdb: (setOpen, type, data, relatedData, onChanged) => (
    <FormulirPendaftaran
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  attendance: (setOpen, type, data, relatedData) => (
    <AttendanceMeetingForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
    />
  ),
  paymentLog: (setOpen, type, data, relatedData, onChanged) => (
    <PaymentForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  bill: (setOpen, type, data, relatedData, onChanged) => (
    <BillForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  user: (setOpen, type, data, relatedData, onChanged) => (
    <UserForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
  facilities: (setOpen, type, data, relatedData, onChanged) => (
    <FacilitiesForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
      onChanged={onChanged}
    />
  ),
};
const FormModal = ({
  table,
  type,
  data,
  id,
  ids,
  lessonId,
  relatedData,
  prefilEmail,
  onDeleted,
  onChanged,
}: FormContainerProps & {
  relatedData?: any;
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
        ? "bg-lamaBlue"
        : "bg-lamaRed";

  const [open, setOpen] = useState(false);

  const universalDeleteHandler = async (
    prevState: CurrentState,
    formData: FormData,
  ): Promise<CurrentState> => {
    const table = formData.get("table") as keyof typeof deleteActionMap;
    const rawIds = formData.getAll("ids");
    const ids = rawIds as string[];

    // console.log(ids, " ids in handler");
    console.log(table, " table in delete handler");

    if (!table || !Array.isArray(ids)) {
      return { success: false, error: true, message: "Invalid data" };
    }

    const deleteFn =
      ids.length > 1 ? bulkDeleteMap[table] : singleDeleteMap[table];

    if (!deleteFn) {
      return { success: false, error: true, message: "Unknown table type" };
    }

    if (ids.length === 1) {
      // ✅ Inject id manually into formData for single delete function
      formData.set("id", ids[0]);
    }

    // Pass both args if deleteFn expects two
    return await deleteFn(prevState, formData);
  };

  const Form = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [state, formAction] = useActionState(universalDeleteHandler, {
      success: false,
      error: false,
    });

    const router = useRouter();
    useEffect(() => {
      if (!state.success && !state.error) return;
      setIsSubmitting(false);
    }, [state.success, state.error]);
    useEffect(() => {
      if (state.success) {
        toast(`${table} telah berhasil di Hapus`);
        setOpen(false);
        if (onDeleted) {
          if (type === "delete" && id) {
            onDeleted([id]); // pass deleted ids
          } else if (type === "deleteMany" && ids) {
            onDeleted(ids);
          } else {
            router.refresh();
          }
        }
        router.refresh();
      }
    }, [state, router]);
    // console.log(relatedData, " relatedData in form Modal");

    return type === "delete" && id ? (
      <form
        action={formAction}
        onSubmit={() => setIsSubmitting(true)}
        className="p4 flex flex-col gap-4"
      >
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="ids" value={id} />

        <span className="text-center font-medium">
          Data akan terhapus. Apakah anda yakin?
        </span>
        <div className="flex justify-center gap-4">
          <button
            type="submit"
            className="bg-red-600 w-1/4 text-white font-semibold px-6 py-3 rounded hover:bg-gray-700 flex items-center justify-center gap-2"
            title="Hapus Item"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-blue-400 rounded-full mr-2"></span>
            )}
            {isSubmitting ? "Memproses..." : "Hapus"}
          </button>
        </div>
      </form>
    ) : type === "deleteMany" && Array.isArray(ids) ? (
      <DeleteManyForm
        setOpen={setOpen}
        table={table}
        ids={ids as string[]}
        formAction={formAction}
        onDeleted={onDeleted}
      />
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData, onChanged)
    ) : (
      "Form tidak ditemukan!"
    );
  };
  if (table === "ppdb" && type === "create")
    return (
      <FormulirPendaftaran
        type={type}
        setOpen={setOpen}
        data={data}
        relatedData={relatedData}
        prefilEmail={prefilEmail}
        onChanged={onChanged}
      />
    ); // Skip rendering
  if (type === "activateAccount") {
    return (
      <>
        <div className="">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center rounded-full hover:bg-lamaYellow transition w-7 h-7"
            title="Aktivasi Akun"
          >
            <Image
              src="/attendance.png"
              alt="Aktivasi Akun"
              width={16}
              height={16}
            />
          </button>
        </div>
        {open && (
          <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-md relative w-[700px] h-auto">
              <ActivateAccountForm
                setOpen={setOpen}
                table={table}
                ids={ids as string[]}
              />
              <div
                className="absolute top-4 right-4 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <Image src="/close.png" width={14} height={14} alt="Tutup" />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
  if (table === "attendance" && type === "create")
    return (
      <>
        <button
          className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
          onClick={() => setOpen(true)}
        >
          <Image src={`/${type}.png`} alt="" width={15} height={16}></Image>
        </button>
        {open && (
          <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div
              className={`bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] `}
            >
              <MeetingForm
                type={"create"}
                setOpen={setOpen}
                data={data}
                relatedData={relatedData}
                lessonId={lessonId}
              />
              <div
                className="absolute top-4 right-4 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <Image src="/close.png" width={14} height={14} alt=""></Image>
              </div>
            </div>
          </div>
        )}
      </>
    ); // Skip rendering

  if (table === "attendance" && type === "update") {
    return (
      <>
        <div className="mb-4">
          <button
            onClick={() => setOpen(true)}
            className={`flex items-center gap-2 ${bgColor} text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition`}
          >
            <Image src={`/${type}.png`} alt="Edit" width={16} height={16} />
            Absensi Kelas
          </button>
        </div>
        {open && (
          <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div
              className={`bg-white p-4 rounded-md relative w-[95%] h-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] 2xl:w-[75%] overflow-y-auto `}
            >
              <AttendanceMeetingForm
                type={"update"}
                setOpen={setOpen}
                data={data}
                relatedData={relatedData}
              />
              <div
                className="absolute top-4 right-4 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <Image src="/close.png" width={14} height={14} alt=""></Image>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (table === "ppdb-setting")
    return (
      <>
        <button
          className={`w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow hover:brightness-90 shadow-md transition`}
          onClick={() => setOpen(true)}
          title="Pengaturan"
        >
          <Image src={`/moreBlack.png`} alt="" width={15} height={16} />
        </button>

        {open && (
          <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div
              className="bg-white p-4 rounded-md relative 
                       w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]"
            >
              <PPDBSettingForm type={"update"} setOpen={setOpen} data={data} />

              <div
                className="absolute top-4 right-4 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <Image src="/close.png" width={14} height={14} alt="" />
              </div>
            </div>
          </div>
        )}
      </>
    );
  if (table === "staffPerfomance" && type !== "delete")
    return (
      <>
        <div className="flex items-center gap-2">
          <span className="text-sm text-yellow-600 font-medium cursor-pointer select-none">
            Tambah
          </span>
          <button
            id="staffPerfTrigger"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow hover:brightness-90 shadow-md transition"
            onClick={() => setOpen(true)}
            title="Tambah Perfoma staff"
          >
            <Image src={`/create.png`} alt="" width={15} height={16} />
          </button>
        </div>

        {open && (
          <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div
              className="bg-white p-4 rounded-md relative 
                       w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]"
            >
              <PerformanceForm
                type={type}
                setOpen={setOpen}
                data={data}
                staffId={id as string}
              />

              <div
                className="absolute top-4 right-4 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <Image src="/close.png" width={14} height={14} alt="" />
              </div>
            </div>
          </div>
        )}
      </>
    );
  if (table === "payment") {
    const bgColor2 =
      type === "create"
        ? "bg-lamaGreen"
        : type === "update"
          ? "bg-lamaBlue"
          : "bg-lamaRed";
    return (
      <>
        <div className="inline-flex items-center gap-2 px-1">
          {/* <span className="text-sm text-yellow-600 font-medium cursor-pointer select-none">
                Tambah
              </span> */}
          <button
            title={
              type === "create"
                ? "Tambah Data"
                : type === "update"
                  ? "Perbarui Data"
                  : "Hapus"
            }
            className={`
    w-7 h-7 flex items-center justify-center rounded-full transition
    ${bgColor2 + " hover:brightness-90 shadow-md"}
  `}
            onClick={() => setOpen(true)}
          >
            <Image
              src={type === "create" ? "/money.png" : `/${type}.png`}
              alt=""
              width={15}
              height={15}
            />
          </button>
        </div>

        {open &&
          createPortal(
            <div
              className="fixed inset-0 z-[5000] bg-black bg-opacity-60 
        flex items-center justify-center p-4"
            >
              <div className="max-h-[90vh] overflow-y-auto w-full flex justify-center">
                <div
                  className="bg-white p-4 rounded-md relative 
                           w-[95%] h-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] 2xl:w-[75%]"
                >
                  <NewPaymentForm
                    type={(type as "create") || "update"}
                    setOpen={setOpen}
                    data={data}
                    relatedData={relatedData}
                    onChanged={onChanged}
                  />

                  <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Image src="/close.png" width={14} height={14} alt="" />
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </>
    );
  }

  if (type === "readMany") {
    switch (table) {
      case "exportPayments": {
        return (
          <>
            <div className="">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full bg-lamaYellow hover:brightness-90 shadow-md transition w-8 h-8"
              >
                <Image src="/Export.png" alt="export" width={16} height={16} />
              </button>
            </div>
            {open && (
              <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md relative w-[700px] h-auto">
                  <ExportPaymentsForm setOpen={setOpen} />
                  <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src="/close.png"
                      width={14}
                      height={14}
                      alt="Tutup"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }
      case "exportResults":
        {
          return (
            <>
              <div className="">
                <button
                  onClick={() => setOpen(true)}
                  className="flex items-center justify-center rounded-full bg-lamaYellow hover:brightness-90 shadow-md transition w-8 h-8"
                >
                  <Image
                    src="/Export.png"
                    alt="export"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
              {open && (
                <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                  <div className="bg-white p-4 rounded-md relative w-[700px] h-auto">
                    <ExportResultsForm
                      setOpen={setOpen}
                      relatedData={relatedData}
                    />
                    <div
                      className="absolute top-4 right-4 cursor-pointer"
                      onClick={() => setOpen(false)}
                    >
                      <Image
                        src="/close.png"
                        width={14}
                        height={14}
                        alt="Tutup"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        }
        break;
      default:
        break;
    }
  }

  if (type === "createMany") {
    switch (table) {
      case "importTeachers": {
        return (
          <>
            <div className="">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full bg-lamaYellow hover:brightness-90 shadow-md transition w-8 h-8"
              >
                <Image src="/import.png" alt="import" width={16} height={16} />
              </button>
            </div>
            {open && (
              <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md relative w-[700px] h-auto">
                  <ImportTeachersForm
                    setOpen={setOpen}
                    data={data}
                    onChanged={onChanged}
                  />
                  <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src="/close.png"
                      width={14}
                      height={14}
                      alt="Tutup"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }
      case "importStudents": {
        return (
          <>
            <div className="">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full bg-lamaYellow hover:brightness-90 shadow-md transition w-8 h-8"
              >
                <Image src="/import.png" alt="import" width={16} height={16} />
              </button>
            </div>
            {open && (
              <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md relative w-[700px] h-auto">
                  <ImportStudentsForm
                    setOpen={setOpen}
                    data={data}
                    onChanged={onChanged}
                  />
                  <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src="/close.png"
                      width={14}
                      height={14}
                      alt="Tutup"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }
      case "importPayments": {
        return (
          <>
            <div className="">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full bg-lamaYellow hover:brightness-90 shadow-md transition w-8 h-8"
              >
                <Image src="/import.png" alt="import" width={16} height={16} />
              </button>
            </div>
            {open && (
              <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md relative w-[700px] h-auto">
                  <ImportPaymentsForm
                    setOpen={setOpen}
                    data={data}
                    onChanged={onChanged}
                  />
                  <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src="/close.png"
                      width={14}
                      height={14}
                      alt="Tutup"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }
      default:
        break;
    }
  }

  if (type === "updateMany") {
    switch (table) {
      case "student": {
        return (
          <>
            <div className="">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full hover:bg-lamaYellow transition w-7 h-7"
                title="Update Banyak"
              >
                <Image
                  src="/updateDark.png"
                  alt="Edit"
                  width={16}
                  height={16}
                />
              </button>
            </div>
            {open && (
              <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md relative w-[95%] h-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] 2xl:w-[75%] overflow-y-auto">
                  <UpdateManyStudentsForm
                    ids={ids as string[]}
                    setOpen={setOpen}
                    table={table}
                    data={data}
                    relatedData={relatedData}
                  />
                  <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src="/close.png"
                      width={14}
                      height={14}
                      alt="Tutup"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }
      case "teacher": {
        return (
          <>
            <div className="">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full hover:bg-lamaYellow transition w-7 h-7"
                title="Update Banyak"
              >
                <Image
                  src="/updateDark.png"
                  alt="Edit"
                  width={16}
                  height={16}
                />
              </button>
            </div>
            {open && (
              <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md relative w-[95%] h-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] 2xl:w-[75%] overflow-y-auto">
                  <UpdateManyTeacherForm
                    ids={ids as string[]}
                    setOpen={setOpen}
                    table={table}
                    data={data}
                    relatedData={relatedData}
                    onChanged={onChanged}
                  />
                  <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src="/close.png"
                      width={14}
                      height={14}
                      alt="Tutup"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }
      case "parent": {
        return (
          <>
            <div className="">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full hover:bg-lamaYellow transition w-7 h-7"
                title="Update Banyak"
              >
                <Image
                  src="/updateDark.png"
                  alt="Edit"
                  width={16}
                  height={16}
                />
              </button>
            </div>
            {open && (
              <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md relative w-[95%] h-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] 2xl:w-[75%] overflow-y-auto">
                  <UpdateManyParentForm
                    ids={ids as string[]}
                    setOpen={setOpen}
                    table={table}
                    data={data}
                    relatedData={relatedData}
                    onChanged={onChanged}
                  />
                  <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src="/close.png"
                      width={14}
                      height={14}
                      alt="Tutup"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }
      case "paymentLog": {
        return (
          <>
            <div className="">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full hover:bg-lamaYellow transition w-7 h-7"
                title="Update Banyak"
              >
                <Image
                  src="/updateDark.png"
                  alt="Edit"
                  width={16}
                  height={16}
                />
              </button>
            </div>
            {open && (
              <div
                className="fixed inset-0 z-[5000] bg-black bg-opacity-60 
        flex items-center justify-center p-4"
              >
                <div
                  className="bg-white p-4 rounded-md relative
    w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]
    max-h-[90vh] overflow-y-auto"
                >
                  <UpdateManyPaymentsForm
                    ids={ids as number[]}
                    setOpen={setOpen}
                    table={table}
                    data={data}
                    relatedData={relatedData}
                    onChanged={onChanged}
                  />
                  <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src="/close.png"
                      width={14}
                      height={14}
                      alt="Tutup"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }
      case "result":
        return (
          <>
            <div className="">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full hover:bg-lamaYellow transition w-7 h-7"
                title="Update Banyak"
              >
                <Image
                  src="/updateDark.png"
                  alt="Edit"
                  width={16}
                  height={16}
                />
              </button>
            </div>
            {open && (
              <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md relative w-[700px] h-auto">
                  <UpdateManyResultsForm
                    ids={ids as number[]}
                    setOpen={setOpen}
                    table={table}
                    data={data}
                    relatedData={relatedData}
                    onChanged={onChanged}
                  />
                  <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src="/close.png"
                      width={14}
                      height={14}
                      alt="Tutup"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case "assignment":
        return (
          <>
            <div className="">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full hover:bg-lamaYellow transition w-7 h-7"
                title="Update Banyak"
              >
                <Image
                  src="/updateDark.png"
                  alt="Edit"
                  width={16}
                  height={16}
                />
              </button>
            </div>
            {open && (
              <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md relative w-[700px] h-auto">
                  <UpdateManyAssignmentsForm
                    ids={ids as number[]}
                    setOpen={setOpen}
                    table={table}
                    data={data}
                    relatedData={relatedData}
                    onChanged={onChanged}
                  />
                  <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src="/close.png"
                      width={14}
                      height={14}
                      alt="Tutup"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case "exam":
        return (
          <>
            <div className="">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full hover:bg-lamaYellow transition w-7 h-7"
                title="Update Banyak"
              >
                <Image
                  src="/updateDark.png"
                  alt="Edit"
                  width={16}
                  height={16}
                />
              </button>
            </div>
            {open && (
              <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md relative w-[700px] h-auto">
                  <UpdateManyExamsForm
                    ids={ids as number[]}
                    setOpen={setOpen}
                    table={table}
                    data={data}
                    relatedData={relatedData}
                    onChanged={onChanged}
                  />
                  <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src="/close.png"
                      width={14}
                      height={14}
                      alt="Tutup"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      default:
        "Form tidak ditemukan!";
        break;
    }
  }

  return (
    <>
      <button
        title={
          type === "create"
            ? "Tambah Data"
            : type === "update"
              ? "Perbarui Data"
              : type === "deleteMany"
                ? "Hapus Banyak"
                : "Hapus"
        }
        className={`
    ${size} flex items-center justify-center rounded-full transition
    ${
      type === "deleteMany"
        ? " text-white hover:bg-purple-300 shadow-sm"
        : bgColor + " hover:brightness-90 shadow-md"
    }
  `}
        onClick={() => setOpen(true)}
      >
        <Image
          src={
            type === "deleteMany"
              ? "/deleteDark.png"
              : type === "delete"
                ? "/deletefix.png"
                : `/${type}.png`
          }
          alt=""
          width={15}
          height={16}
        />
      </button>

      {open &&
        createPortal(
          <div
            className={`
        fixed inset-0 z-[5000] bg-black bg-opacity-60 
        flex items-center justify-center p-4
      `}
          >
            <div className="max-h-[90vh] overflow-y-auto w-full flex justify-center">
              <div
                className={` bg-white p-4 rounded-md relative
    w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]
    max-h-[90vh] overflow-y-auto
      ${
        ["delete", "deleteMany", "createMany"].includes(type)
          ? "w-[350px] h-auto"
          : [
                "student",
                "ppdb",
                "teacher",
                "paymentLog",
                "parent",
                "staff",
              ].includes(table)
            ? "w-[95%] h-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] 2xl:w-[75%]"
            : ""
      }
    `}
              >
                <Form />

                <div
                  className="absolute top-4 right-4 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  <Image src="/close.png" width={14} height={14} alt="" />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default FormModal;
