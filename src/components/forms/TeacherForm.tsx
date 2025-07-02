"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchema";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createTeacher, CurrentState, updateTeacher } from "@/lib/actions";
import { useFormState } from "react-dom";
import { CldUploadWidget } from "next-cloudinary";
import Select from "react-select";
import { Day } from "@prisma/client";

const TeacherForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: any;
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      subjects: [],
      lessons: [],
      classes: [],
    },
  });
  console.log("✅ TeacherForm rendered");

  const [img, setImg] = useState<any>();
  // const [state, formAction] = useActionState(
  //   type === "create" ? createTeacher : updateTeacher,
  //   initialState
  // );

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    type === "create" ? createTeacher : updateTeacher,
    initialState
  );

  const onSubmit = handleSubmit((data) => {
    console.log("✅ Form data ready to submit:", data);
    startTransition(() => {
      formAction({ ...data, img: img?.secure_url });
    });
  });

  const router = useRouter();

  const { subjects = [], classes = [], lessons = [] } = relatedData ?? {};
  const subjectOption = subjects.map(
    (subject: { id: number; name: string }) => ({
      value: subject.id,
      label: `${subject.name}`,
    })
  );
  const classOptions = classes.map((kelas: { id: number; name: string }) => ({
    value: kelas.id,
    label: `${kelas.name}`,
  }));
  const lessonOptions = lessons.map(
    (lesson: { id: number; name: string; day: Day }) => ({
      value: lesson.id,
      label: `${lesson.name} ${lesson.day}`,
    })
  );
  useEffect(() => {
    console.log("✅ data received:", data);
    if (type === "update" && data?.subjects) {
      reset({
        ...data,
        birthday: data?.birthday
          ? new Date(data.birthday).toISOString().split("T")[0]
          : "",
        subjects: data.subjects.map((s: { id: number }) => s.id),
        lessons: data.lessons.map((l: { id: number }) => l.id),
        classes: data.classes.map((c: { id: number }) => c.id),
      });
    }
    if (state.success) {
      toast(
        `Guru telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router, data, reset]);

  return (
    <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tambah Guru baru" : "Edit Guru"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Autentikasi
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        ></InputField>
        <InputField
          label="Email"
          name="email"
          type="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        ></InputField>
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        ></InputField>
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Personal
      </span>
      <CldUploadWidget
        uploadPreset="SMPI SERUA"
        onSuccess={(result, { widget }) => {
          setImg(result.info);
          widget.close();
        }}
      >
        {({ open }) => {
          return (
            <div
              className="text-xs text-gray-400 flex items-center gap-2 cursor-pointer"
              onClick={() => open()}
            >
              <Image src="/upload.png" alt="" width={28} height={28}></Image>
              <span>Upload photo</span>
            </div>
          );
        }}
      </CldUploadWidget>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Nama depan"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        ></InputField>
        <InputField
          label="Nama Belakang"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors?.surname}
        ></InputField>
        <InputField
          label="No. Telepon"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors?.phone}
        ></InputField>
        <InputField
          label="Alamat"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors?.address}
        ></InputField>
        {/* <InputField
          label="Gol. darah"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors?.bloodType}
        ></InputField> */}
        <InputField
          label="Birthday"
          name="birthday"
          type="date"
          register={register}
          error={errors?.birthday}
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

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Jenis Kelamin</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Lelaki</option>
            <option value="FEMALE">Perempuan</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        {/* <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Mata Pelajaaran</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjects")}
            defaultValue={data?.subjects}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjects?.message && (
            <p className="text-xs text-red-400">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div> */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Mata Pelajaran</label>

          <Controller
            name="subjects"
            control={control}
            render={({ field }) => {
              const selectedValues = subjectOption.filter(
                (opt: { value: number; label: string }) =>
                  field.value?.includes(opt.value)
              );
              return (
                <Select
                  {...field}
                  isMulti
                  options={subjectOption}
                  value={selectedValues}
                  onChange={(selected) => {
                    field.onChange(selected.map((opt) => opt.value));
                  }}
                />
              );
            }}
          />

          {errors.subjects?.message && (
            <p className="text-xs text-red-400">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Jadwal</label>

          <Controller
            name="lessons"
            control={control}
            defaultValue={
              data?.lessons?.map(
                (lesson: { id: number; name: string; day: Day }) => lesson.id
              ) || []
            }
            render={({ field }) => {
              const selectedValues = lessonOptions.filter(
                (opt: { value: number; label: string }) =>
                  field.value?.includes(opt.value)
              );
              return (
                <Select
                  {...field}
                  isMulti
                  options={lessonOptions}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari Jadwal..."
                  value={selectedValues}
                  onChange={(selectedOptions) => {
                    field.onChange(
                      selectedOptions.map((opt) => Number(opt.value))
                    );
                  }}
                />
              );
            }}
          />

          {errors.lessons?.message && (
            <p className="text-xs text-red-400">
              {errors.lessons.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Kelas</label>

          <Controller
            name="classes"
            control={control}
            defaultValue={
              data?.classes?.map(
                (kelas: { id: number; name: string }) => kelas.id
              ) || []
            }
            render={({ field }) => {
              const selectedValues = classOptions.filter(
                (opt: { value: number; label: string }) =>
                  field.value?.includes(opt.value)
              );

              return (
                <Select
                  {...field}
                  isMulti
                  options={classOptions}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari Kelas..."
                  value={selectedValues}
                  onChange={(selectedOptions) => {
                    field.onChange(
                      selectedOptions.map((opt) => Number(opt.value))
                    );
                  }}
                />
              );
            }}
          />

          {errors.classes?.message && (
            <p className="text-xs text-red-400">
              {errors.classes.message.toString()}
            </p>
          )}
        </div>
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
export default TeacherForm;
