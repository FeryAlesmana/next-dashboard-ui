"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchema";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { createStudent, CurrentState, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import Select from "react-select";
import { cloudinaryUpload } from "@/lib/upload/cloudinaryUpload";
import { Preview } from "../preview";
import UploadPhoto from "../UploadPhoto";

const StudentForm = ({
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
    formState: { errors },
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [img, setImg] = useState<any>();
  const [dokumen, setDokumen] = useState<{
    ijazah?: string;
    akte?: string;
    kk_ktp_sktm?: string;
  }>({});
  const createStudentHandler = async (
    prevState: CurrentState,
    payload: StudentSchema
  ): Promise<CurrentState> => {
    return await createStudent(prevState, payload);
  };

  const updateStudentHandler = async (
    prevState: CurrentState,
    payload: StudentSchema
  ): Promise<CurrentState> => {
    return await updateStudent(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    type === "create" ? createStudentHandler : updateStudentHandler,
    initialState
  );

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    name: keyof typeof dokumen
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await cloudinaryUpload(file, "ppdb");

      setDokumen((prev) => ({ ...prev, [name]: uploadedUrl }));
    } catch (err) {
      toast.error("Upload gagal");
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  const onSubmit = handleSubmit((data) => {
    setIsSubmitting(true);
    startTransition(() => {
      formAction({
        ...data,
        img: img?.secure_url,
        awards_date: data.awards_date ? new Date(data.awards_date) : null,
        dokumenIjazah: dokumen.ijazah ?? "",
        dokumenAkte: dokumen.akte ?? "",
        dokumenKKKTP: dokumen.kk_ktp_sktm ?? "",
      });
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Siswa telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);
  const { grades, classes, parents } = relatedData;

  const parentOption = parents.map(
    (parent: { id: string; name: string; surname: string }) => ({
      value: parent.id,
      label: `${parent.name} ${parent.surname}`,
    })
  );
  return (
    <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tambah Siswa baru" : "Edit Siswa"}
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
      <UploadPhoto
        imageUrl={img?.secure_url || data?.img}
        onUpload={(url) => setImg({ secure_url: url })}
      />
      <div className="flex justify-left flex-wrap gap-4 gap-x-20">
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
        <InputField
          label="Birthday"
          name="birthday"
          type="date"
          defaultValue={
            data?.birthday
              ? new Date(data.birthday).toISOString().split("T")[0]
              : ""
          }
          register={register}
          error={errors?.birthday}
        ></InputField>
        <InputField
          label="Tempat Lahir"
          name="birthPlace"
          defaultValue={data?.student_details?.birthPlace}
          register={register}
          error={errors?.birthPlace}
        ></InputField>
        <InputField
          label="Asal sekolah"
          name="asalSekolah"
          defaultValue={data?.student_details?.asalSekolah}
          register={register}
          error={errors?.asalSekolah}
        ></InputField>
        <InputField
          label="NPSN"
          name="npsn"
          defaultValue={data?.student_details?.npsn}
          register={register}
          error={errors?.npsn}
        ></InputField>
        <InputField
          label="NISN"
          name="nisn"
          defaultValue={data?.student_details?.nisn}
          register={register}
          error={errors?.nisn}
        ></InputField>
        <InputField
          label="No. Ijazah"
          name="no_ijz"
          defaultValue={data?.student_details?.no_ijz}
          register={register}
          error={errors?.no_ijz}
        ></InputField>
        <InputField
          label="NIK"
          name="nik"
          defaultValue={data?.student_details?.nik}
          register={register}
          error={errors?.nik}
        ></InputField>
        <InputField
          label="Kode Pos"
          name="postcode"
          defaultValue={data?.student_details?.postcode}
          register={register}
          error={errors?.postcode}
        ></InputField>
        {/* <InputField
          label="RT"
          name="rt"
          defaultValue={data?.student_details?.rt}
          register={register}
          error={errors?.rt}
        ></InputField>
        <InputField
          label="RW"
          name="rw"
          defaultValue={data?.student_details?.rw}
          register={register}
          error={errors?.rw}
        ></InputField>
        <InputField
          label="Kelurahan"
          name="kelurahan"
          defaultValue={data?.student_details?.kelurahan}
          register={register}
          error={errors?.kelurahan}
        ></InputField>
        <InputField
          label="Kota"
          name="kota"
          defaultValue={data?.student_details?.kota}
          register={register}
          error={errors?.kota}
        ></InputField> */}
        <InputField
          label="Transportasi"
          name="transportation"
          defaultValue={data?.student_details?.transportation}
          register={register}
          error={errors?.transportation}
        ></InputField>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Tempat Tinggal</label>
          <select
            {...register("tempat_tinggal")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            defaultValue={data?.student_details?.tempat_tinggal}
          >
            <option value="">-- Pilih --</option>
            <option value="Orang_Tua">Orang Tua</option>
            <option value="Wali">Wali</option>
            <option value="Kost">Kost</option>
            <option value="Asrama">Asrama</option>
            <option value="Panti_asuhan">Panti Asuhan</option>
            <option value="Pesantren">Pesantren</option>
          </select>
          {errors.tempat_tinggal && (
            <p className="text-red-600">{errors.tempat_tinggal.message}</p>
          )}
        </div>
        <InputField
          label="KPS"
          name="kps"
          defaultValue={data?.student_details?.kps}
          register={register}
          error={errors?.kps}
        ></InputField>
        <InputField
          label="No KPS"
          name="no_kps"
          defaultValue={data?.student_details?.no_kps}
          register={register}
          error={errors?.no_kps}
        ></InputField>
        <InputField
          label="Tinggi"
          name="height"
          defaultValue={data?.student_details?.height}
          register={register}
          error={errors?.height}
        ></InputField>
        <InputField
          label="Berat bedan"
          name="weight"
          defaultValue={data?.student_details?.weight}
          register={register}
          error={errors?.weight}
        ></InputField>
        <InputField
          label="Jarak dari rumah"
          name="distance_from_home"
          defaultValue={data?.student_details?.distance_from_home}
          register={register}
          error={errors?.distance_from_home}
        ></InputField>
        <InputField
          label="Waktu tempuh"
          name="time_from_home"
          defaultValue={data?.student_details?.time_from_home}
          register={register}
          error={errors?.time_from_home}
        ></InputField>
        <InputField
          label="Penghargaan"
          name="awards"
          defaultValue={data?.student_details?.awards}
          register={register}
          error={errors?.awards}
        ></InputField>
        <InputField
          label="Jumlah saudara"
          name="number_of_siblings"
          defaultValue={data?.student_details?.number_of_siblings}
          register={register}
          error={errors?.number_of_siblings}
        ></InputField>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Tingkat Penghargaan</label>
          <select
            {...register("awards_lvl")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            defaultValue={data?.student_details?.awards_lvl}
          >
            <option value="">-- Pilih --</option>
            <option value="kecamatan">Kecamatan</option>
            <option value="kota">Kota</option>
            <option value="kabupaten">Kabupaten</option>
            <option value="provinsi">Provinsi</option>
            <option value="nasional">Nasional</option>
            <option value="internasional">Internasional</option>
          </select>
          {errors.awards_lvl && (
            <p className="text-red-600">{errors.awards_lvl.message}</p>
          )}
        </div>
        <InputField
          label="Tanggal penghargaan"
          name="awards_date"
          type="date"
          defaultValue={
            data?.student_details?.awards_date
              ? new Date(data?.student_details?.awards_date)
                  .toISOString()
                  .split("T")[0]
              : ""
          }
          register={register}
          error={errors?.awards_date}
        ></InputField>
        <InputField
          label="Beasiswa"
          name="scholarship"
          defaultValue={data?.student_details?.scholarship}
          register={register}
          error={errors?.scholarship}
        ></InputField>
        <InputField
          label="Sumber Beasiswa"
          name="scholarship_detail"
          defaultValue={data?.student_details?.scholarship_detail}
          register={register}
          error={errors?.scholarship_detail}
        ></InputField>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Orang tua</label>

          <Controller
            name="parentId"
            control={control}
            defaultValue={data?.parentId || ""}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  options={parentOption}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Cari Ortu..."
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={
                    parentOption.find(
                      (opt: { value: string; label: string }) =>
                        opt.value === field.value
                    ) || null
                  }
                />
              );
            }}
          />

          {errors.parentId?.message && (
            <p className="text-xs text-red-400">
              {errors.parentId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">
            Fotokopi Ijazah / STTB
          </label>

          {/* Upload input (only shown if no file yet) */}
          {!dokumen.ijazah && !data?.student_details?.dokumenIjazah && (
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileUpload(e, "ijazah")}
              className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white"
            />
          )}

          {/* Show preview if file exists in local state */}
          {dokumen.ijazah && (
            <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
              <a
                href={dokumen.ijazah}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline truncate"
              >
                Lihat Dokumen (Ijazah)
              </a>
              <button
                type="button"
                onClick={() =>
                  setDokumen((prev) => ({ ...prev, ijazah: undefined }))
                }
                className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
              >
                Hapus
              </button>
            </div>
          )}

          {/* Show preview if file exists in DB but not in local state */}
          {!dokumen.ijazah && data?.student_details?.dokumenIjazah && (
            <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
              <a
                href={data.student_details.dokumenIjazah}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline truncate"
              >
                Lihat Dokumen (Ijazah)
              </a>
              <button
                type="button"
                onClick={() =>
                  setDokumen((prev) => ({ ...prev, ijazah: undefined }))
                }
                className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
              >
                Hapus
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">
            Fotokopi Akte Kelahiran
          </label>

          {/* Upload input (only shown if no file yet) */}
          {!dokumen.akte && !data?.student_details?.dokumenAkte && (
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileUpload(e, "akte")}
              className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white"
            />
          )}

          {/* Show preview if file exists in local state */}
          {dokumen.akte && (
            <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
              <a
                href={dokumen.akte}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline truncate"
              >
                Lihat Dokumen (akte)
              </a>
              <button
                type="button"
                onClick={() =>
                  setDokumen((prev) => ({ ...prev, akte: undefined }))
                }
                className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
              >
                Hapus
              </button>
            </div>
          )}

          {/* Show preview if file exists in DB but not in local state */}
          {!dokumen.akte && data?.student_details?.dokumenAkte && (
            <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
              <a
                href={data.student_details.dokumenAkte}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline truncate"
              >
                Lihat Dokumen (Akte)
              </a>
              <button
                type="button"
                onClick={() =>
                  setDokumen((prev) => ({ ...prev, akte: undefined }))
                }
                className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
              >
                Hapus
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">
            Fotokopi KK, KTP Orang Tua, SKTM / KIP
          </label>

          {/* Upload input (only shown if no file yet) */}
          {!dokumen.kk_ktp_sktm && !data?.student_details?.dokumenKKKTP && (
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileUpload(e, "kk_ktp_sktm")}
              className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white"
            />
          )}

          {/* Show preview if file exists in local state */}
          {dokumen.kk_ktp_sktm && (
            <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
              <a
                href={dokumen.kk_ktp_sktm}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline truncate"
              >
                Lihat Dokumen (KK, KTP, SKTM/KIP)
              </a>
              <button
                type="button"
                onClick={() =>
                  setDokumen((prev) => ({ ...prev, akte: undefined }))
                }
                className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
              >
                Hapus
              </button>
            </div>
          )}

          {/* Show preview if file exists in DB but not in local state */}
          {!dokumen.kk_ktp_sktm && data?.student_details?.dokumenKKKTP && (
            <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
              <a
                href={data.student_details.dokumenKKKTP}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline truncate"
              >
                Lihat Dokumen (KK, KTP, SKTM/KIP)
              </a>
              <button
                type="button"
                onClick={() =>
                  setDokumen((prev) => ({ ...prev, kk_ktp_sktm: undefined }))
                }
                className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
              >
                Hapus
              </button>
            </div>
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
        {data.student_details && (
          <InputField
            label="sdId"
            name="sdId"
            defaultValue={data?.student_details?.id}
            register={register}
            error={errors?.sdId}
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Tingkat</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            {grades.map((grade: { id: number; level: number }) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-400">Kelas</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId}
          >
            {classes.map(
              (kelas: {
                id: number;
                name: string;
                capacity: number;
                _count: { students: number };
              }) => (
                <option value={kelas.id} key={kelas.id}>
                  {kelas.name} - {kelas._count.students + "/" + kelas.capacity}{" "}
                  Kapasitas
                </option>
              )
            )}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
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
            ? "Tambah murid"
            : "Update dan Simpan"}
        </button>
      </div>

    </form>
  );
};

export default StudentForm;
