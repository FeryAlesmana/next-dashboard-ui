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
import {
  CreateteacherSchema,
  createTeacherSchema,
  TeacherSchema,
  UpdateteacherSchema,
  updateTeacherSchema,
} from "@/lib/formValidationSchema";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createTeacher, CurrentState, updateTeacher } from "@/lib/actions";
import Select from "react-select";
import { Day } from "@prisma/client";
import UploadPhoto from "../UploadPhoto";
import z from "zod";
import ConfirmDialog from "../ConfirmDialog";
import { BaseFormProps } from "./AssignmentForm";

const TeacherForm = ({
  type,
  data,
  setOpen,
  relatedData,
  onChanged,
}: BaseFormProps) => {
  const schema = type === "create" ? createTeacherSchema : updateTeacherSchema;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<
    typeof schema extends z.ZodTypeAny ? z.infer<typeof schema> : never
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      subjects: [],
      lessons: [],
      classes: [],
      password: "", // ✅ Always set as string to avoid `undefined` issues
    },
  });
  // console.log("✅ TeacherForm rendered");
  const [img, setImg] = useState<any>();
  const createTeacherHandler = async (
    prevState: CurrentState,
    payload: CreateteacherSchema
  ): Promise<CurrentState> => {
    return await createTeacher(prevState, payload);
  };

  const updateTeacherHandler = async (
    prevState: CurrentState,
    payload: UpdateteacherSchema
  ): Promise<CurrentState> => {
    return await updateTeacher(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    type === "create" ? createTeacherHandler : updateTeacherHandler,
    initialState
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  const handleSubmitForm = handleSubmit((data) => {
    setIsSubmitting(true);
    setShowConfirm(false);
    const payload = {
      ...data,
      img: img?.secure_url,
    };
    console.log(payload, "isi Payload");

    startTransition(() => {
      formAction(payload);
    });
  });
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true); // Show modal before submit
  };

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
        img: img?.secure_url,
      });
    }
    if (state.success) {
      const updatedItem = state.data ?? data;
      toast(
        `Guru telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      if (onChanged && updatedItem) {
        onChanged(updatedItem); // 🔥 notify parent so it can update localData
      } else {
        router.refresh(); // fallback if no handler passed
      }
      setOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 800); // 0.8s delay
    }
  }, [state, type, setOpen, router, data, reset, img, onChanged]);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Tambah Guru baru" : "Edit Guru"}
        </h1>
        <span className="text-xs text-gray-400 font-medium">
          Informasi Autentikasi
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <div>
            <InputField
              label="Username"
              name="username"
              defaultValue={data?.username}
              register={register}
              error={errors?.username}
              table="teacher"
            />
          </div>

          <div>
            <InputField
              label="Email"
              name="email"
              type="email"
              defaultValue={data?.email}
              register={register}
              placeholder="email@example.com"
              error={errors?.email}
              table="teacher"
            />
          </div>

          <div>
            <InputField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              defaultValue={data?.password}
              register={register}
              error={errors?.password}
              table="teacher"
            />
            <label className="flex items-center gap-2 mt-1 text-xs">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              Show password
            </label>
          </div>
        </div>

        <span className="text-xs text-gray-400 font-medium">
          Informasi Personal
        </span>
        <UploadPhoto
          imageUrl={img?.secure_url || data?.img}
          onUpload={(url) => setImg({ secure_url: url })}
        />
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
            name="namalengkap"
            defaultValue={data?.namalengkap}
            register={register}
            error={errors?.namalengkap}
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
          <InputField
            label="RT"
            name="rt"
            defaultValue={data?.rt}
            register={register}
            error={errors?.rt}
          ></InputField>
          <InputField
            label="RW"
            name="rw"
            defaultValue={data?.rw}
            register={register}
            error={errors?.rw}
          ></InputField>
          <InputField
            label="Kelurahan"
            name="kelurahan"
            defaultValue={data?.kelurahan}
            register={register}
            error={errors?.kelurahan}
          ></InputField>
          <InputField
            label="Kecamatan"
            name="kecamatan"
            defaultValue={data?.kecamatan}
            register={register}
            error={errors?.kecamatan}
          ></InputField>
          <InputField
            label="Kota"
            name="kota"
            defaultValue={data?.kota}
            register={register}
            error={errors?.kota}
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
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-400">Agama</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("religion")}
              defaultValue={data?.religion}
            >
              <option value="">Pilih</option>
              <option value="Islam">Islam</option>
              <option value="Kristen">Kristen</option>
              <option value="Buddha">Budha</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            {errors.religion?.message && (
              <p className="text-xs text-red-400">
                {errors.religion.message.toString()}
              </p>
            )}
          </div>
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

          <div className="flex flex-col gap-2 w-full md:w-1/4 ">
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

          <div className="flex flex-col gap-2 w-full md:w-1/4 ">
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
                    className="text-sm"
                    classNamePrefix="select"
                    placeholder="Cari Matpel..."
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
          <div className="flex flex-col gap-2 w-full md:w-1/4 ">
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
            <label className="text-xs text-gray-400">Pengurus Kelas..</label>

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
              ? "Tambah Guru"
              : "Update Guru"}
          </button>
        </div>
      </form>
      {showConfirm && (
        <ConfirmDialog
          message={type === "create" ? "Tambah Guru baru?" : "Ubah Guru?"}
          onConfirm={handleSubmitForm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};
export default TeacherForm;
