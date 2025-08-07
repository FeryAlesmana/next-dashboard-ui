"use client";

import {
  CurrentState,
  deleteAnnouncement,
  deleteAssignment,
  deleteAttendance,
  deleteClass,
  deleteEvent,
  deleteExam,
  deleteLesson,
  deleteParent,
  deletePaymentLog,
  deletePaymentLogs,
  deletePpdb,
  deleteResult,
  deleteStudent,
  deleteStudents,
  deleteSubject,
  deleteTeacher,
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
import { role } from "@/lib/data";
import DeleteManyForm from "./forms/DeleteMany";
import UpdateManyStudentsForm from "./forms/UpdateManyStudents";
import UpdateManyPaymentsForm from "./forms/UpdateManyPaymentForm";
import UpdateManyTeacherForm from "./forms/UpdateManyTeacher";
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
};

const bulkDeleteMap = {
  student: deleteStudents,
  teacher: deleteStudents,
  parent: deleteStudents,
  class: deleteStudents,
  subject: deleteStudents,
  lesson: deleteStudents,
  exam: deleteStudents,
  assignment: deleteStudents,
  result: deleteStudents,
  attendance: deleteStudents,
  event: deleteStudents,
  announcement: deleteStudents,
  ppdb: deleteStudents,
  paymentLog: deletePaymentLogs,
};

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
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
  }
);
const AttendanceMeetingForm = dynamic(
  () => import("./forms/AttendanceMeetingForm"),
  {
    loading: () => <h1>Loading...</h1>,
  }
);
const MeetingForm = dynamic(() => import("./forms/MeetingForm"), {
  loading: () => <h1>Loading...</h1>,
});
const PaymentForm = dynamic(() => import("./forms/PaymentForm"), {
  loading: () => <h1>Loading...</h1>,
});

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any,
    role?: string,
    lessonId?: string
  ) => JSX.Element;
} = {
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      setOpen={setOpen}
      type={type}
      data={data}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      setOpen={setOpen}
      type={type}
      data={data}
      relatedData={relatedData}
    />
  ),
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
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
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      setOpen={setOpen}
      type={type}
      data={data}
      relatedData={relatedData}
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
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
    />
  ),
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
    />
  ),
  result: (setOpen, type, data, relatedData) => (
    <ResultForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
    />
  ),
  ppdb: (setOpen, type, data, relatedData) => (
    <FormulirPendaftaran
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
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
  paymentLog: (setOpen, type, data, relatedData) => (
    <PaymentForm
      type={type}
      setOpen={setOpen}
      data={data}
      relatedData={relatedData}
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
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  const universalDeleteHandler = async (
    prevState: CurrentState,
    formData: FormData
  ): Promise<CurrentState> => {
    const table = formData.get("table") as keyof typeof deleteActionMap;
    const rawIds = formData.getAll("ids");
    const ids = rawIds as string[];

    console.log(ids, " ids in delete handler");
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
    const [state, formAction] = useActionState(universalDeleteHandler, {
      success: false,
      error: false,
    });

    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast(`${table} telah berhasil di Hapus`);
        setOpen(false);
        router.refresh();
      }
    }, [state, router]);
    console.log(id, " id in form Modal");

    return type === "delete" && id ? (
      <form action={formAction} className="p4 flex flex-col gap-4">
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="ids" value={id} />

        <span className="text-center font-medium">
          Data akan terhapus. Apakah anda yakin?
        </span>
        <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
          Hapus
        </button>
      </form>
    ) : type === "deleteMany" && Array.isArray(ids) ? (
      <DeleteManyForm
        table={table}
        ids={ids as string[]}
        formAction={formAction}
      />
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData)
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
      />
    ); // Skip rendering
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
            Isi Absensi Kelas
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

  if (table === "student" && type === "updateMany") {
    return (
      <>
        <div className="">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center rounded-full hover:bg-lamaYellow transition w-7 h-7"
          >
            <Image src="/updateDark.png" alt="Edit" width={16} height={16} />
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
                <Image src="/close.png" width={14} height={14} alt="Tutup" />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
  if (table === "teacher" && type === "updateMany") {
    return (
      <>
        <div className="">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center rounded-full hover:bg-lamaYellow transition w-7 h-7"
          >
            <Image src="/updateDark.png" alt="Edit" width={16} height={16} />
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
  if (table === "paymentLog" && type === "updateMany") {
    return (
      <>
        <div className="">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center rounded-full hover:bg-lamaYellow transition w-7 h-7"
          >
            <Image src="/updateDark.png" alt="Edit" width={16} height={16} />
          </button>
        </div>
        {open && (
          <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-md relative w-[95%] h-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] 2xl:w-[75%] overflow-y-auto">
              <UpdateManyPaymentsForm
                ids={ids as number[]}
                setOpen={setOpen}
                table={table}
                data={data}
                relatedData={relatedData}
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

  return (
    <>
      <button
        className={`
    ${size} flex items-center justify-center rounded-full transition
    ${
      type === "deleteMany"
        ? " text-white hover:bg-purple-300 shadow-sm"
        : bgColor
    }
  `}
        onClick={() => setOpen(true)}
      >
        <Image
          src={`/${type === "deleteMany" ? "deleteDark" : type}.png`}
          alt=""
          width={15}
          height={16}
        />
      </button>

      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div
            className={`bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] ${
              type === "delete" || type === "deleteMany"
                ? "w-[350px] h-auto"
                : ["student", "ppdb", "teacher", "paymentLog"].includes(table)
                ? "w-[95%] h-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] 2xl:w-[75%] overflow-y-auto"
                : "w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]"
            }`}
          >
            <Form />
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
};

export default FormModal;
