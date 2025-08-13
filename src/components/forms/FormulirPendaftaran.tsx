"use client";
import React, {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import Select from "react-select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fieldLabelMap,
  PpdbSchema,
  ppdbSchema,
} from "@/lib/formValidationSchema";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createPpdb, CurrentState, updatePpdb } from "@/lib/actions";
import { cloudinaryUpload } from "@/lib/upload/cloudinaryUpload";

const FORM_KEY = "ppdb_draft_form";

const FormulirPendaftaran = ({
  data,
  type,
  relatedData,
  setOpen,
  prefilEmail,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  data?: any;
  type: "create" | "update";
  relatedData: any;
  prefilEmail?: string;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<PpdbSchema>({
    resolver: zodResolver(ppdbSchema),
    defaultValues: {
      isvalid: false, // set default to false here
    },
  });
  const watchedValues = watch();

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(FORM_KEY, JSON.stringify(watchedValues));
    }, 500); // Save after 500ms of inactivity

    return () => clearTimeout(timeout);
  }, [watchedValues]);

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem(FORM_KEY);
    if (saved) {
      const values = JSON.parse(saved);
      for (const key in values) {
        setValue(key as keyof PpdbSchema, values[key]);
      }
    }

    if (type === "create" && prefilEmail) {
      reset({
        isvalid: false,
        email: prefilEmail ?? "",
      });
    }

    if (type === "update" && data) {
      reset({
        id: data.id,
        name: data.name ?? "",
        namalengkap: data.namalengkap ?? "",
        birthPlace: data.birthPlace ?? "",
        birthday: data.birthday
          ? new Date(data.birthday).toISOString().split("T")[0]
          : "",
        address: data.address ?? "",
        rw: data.rw ?? "",
        rt: data.rt ?? "",
        kelurahan: data.kelurahan ?? "",
        kecamatan: data.kecamatan ?? "",
        kota: data.kota ?? "",
        asalSekolah: data.asalSekolah ?? "",
        awards: data.awards ?? "",
        awards_date: data.awards_date
          ? new Date(data.awards_date).toISOString().split("T")[0]
          : "",
        awards_lvl: data.awards_lvl ?? "",
        distance_from_home: data.distance_from_home ?? 0,
        dokumenAkte: data.dokumenAkte ?? "",
        dokumenIjazah: data.dokumenIjazah ?? "",
        dokumenKKKTP: data.dokumenKKKTP ?? "",
        dokumenPasfoto: data.dokumenPasfoto ?? "",
        email: data.email ?? "",
        height: data.height ?? 0,
        isvalid: Boolean(data.isvalid),
        kps: data.kps ?? "",
        namaAyah: data.namaAyah ?? "",
        namaIbu: data.namaIbu ?? "",
        namaWali: data.namaWali ?? "",
        nik: data.nik ?? "",
        nisn: data.nisn ?? "",
        // noWa: data.noWa ?? "",
        no_ijz: data.no_ijz ?? "",
        no_kps: data.no_kps ?? "",
        npsn: data.npsn ?? "",
        number_of_siblings: data.number_of_siblings ?? 0,
        pekerjaanAyah: data.pekerjaanAyah ?? "",
        pekerjaanIbu: data.pekerjaanIbu ?? "",
        pekerjaanWali: data.pekerjaanWali ?? "",
        pendidikanAyah: data.pendidikanAyah ?? "",
        pendidikanIbu: data.pendidikanIbu ?? "",
        pendidikanWali: data.pendidikanWali ?? "",
        penghasilanAyah: data.penghasilanAyah ?? 0,
        penghasilanIbu: data.penghasilanIbu ?? 0,
        penghasilanWali: data.penghasilanWali ?? 0,
        phone: data.phone ?? "",
        postcode: data.postcode ?? 0,
        religion: data.religion ?? "",
        scholarship: data.scholarship ?? "",
        scholarship_date: data.scholarship_date
          ? new Date(data.scholarship_date).toISOString().split("T")[0]
          : "",
        scholarship_detail: data.scholarship_detail ?? "",
        sex: data.sex ?? "",
        tahunLahirAyah: data.tahunLahirAyah
          ? new Date(data.tahunLahirAyah).toISOString().split("T")[0]
          : "",
        tahunLahirIbu: data.tahunLahirIbu
          ? new Date(data.tahunLahirIbu).toISOString().split("T")[0]
          : "",
        tahunLahirWali: data.tahunLahirWali
          ? new Date(data.tahunLahirWali).toISOString().split("T")[0]
          : "",
        telpAyah: data.telpAyah ?? "",
        telpIbu: data.telpIbu ?? "",
        telpWali: data.telpWali ?? "",
        tempat_tinggal: data.tempat_tinggal ?? "",
        time_from_home: data.time_from_home ?? 0,
        transportation: data.transportation ?? "",
        weight: data.weight ?? 0,
      });
    }
  }, [setValue, data, reset, type, prefilEmail]);
  const [dokumen, setDokumen] = useState<{
    ijazah?: string;
    akte?: string;
    pasfoto?: string;
    kk_ktp_sktm?: string;
  }>({});

  // For email feedback
  const [selectedFields, setSelectedFields] = useState<any[]>([]);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const createPpdbHandler = async (
    prevState: CurrentState,
    payload: PpdbSchema
  ): Promise<CurrentState> => {
    return await createPpdb(prevState, payload);
  };

  const updatePpdbHandler = async (
    prevState: CurrentState,
    payload: PpdbSchema
  ): Promise<CurrentState> => {
    return await updatePpdb(prevState, payload);
  };

  const initialState: CurrentState = {
    success: false,
    error: false,
    message: "",
  };
  const [state, formAction] = useActionState(
    type === "create" ? createPpdbHandler : updatePpdbHandler,
    initialState
  );
  const [uploadingField, setUploadingField] = useState<
    keyof typeof dokumen | null
  >(null);
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    name: keyof typeof dokumen
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(name); // show spinner for this field
    try {
      const uploadedUrl = await cloudinaryUpload(file, "ppdb");

      setDokumen((prev) => ({ ...prev, [name]: uploadedUrl }));
    } catch (err) {
      toast.error("Upload gagal");
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = handleSubmit((data) => {
    setIsSubmitting(true);
    startTransition(() => {
      formAction({
        ...data,
        dokumenIjazah: dokumen.ijazah ?? "",
        dokumenAkte: dokumen.akte ?? "",
        dokumenKKKTP: dokumen.kk_ktp_sktm ?? "",
        dokumenPasfoto: dokumen.pasfoto ?? "",
      });
    });
  });

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  const router = useRouter();

  useEffect(() => {
    console.log("state.success:", state.success);
    if (state.success) {
      localStorage.removeItem(FORM_KEY);
      toast(
        `PPDB telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      if (type === "update") {
        setOpen(false);
      }
      setTimeout(() => {
        if (type === "update") setOpen(false);
        router.refresh();
      }, 300); // 300ms delay;
    }
    if (state.error && state.message) {
      // If the error is a field name (like "nisn"), set it on that field
      if (
        ["nisn", "nik", "npsn", "email", "phone", "no_kps"].includes(
          state.message
        )
      ) {
        setError(state.message as keyof PpdbSchema, {
          type: "manual",
          message: "Sudah ada murid dengan data tersebut.",
        });
      }
    }
  }, [state, type, router, setOpen, setError]);
  // All possible field options for react-select
  const fieldOptions = Object.keys(ppdbSchema.shape)
    .filter(
      (key) => !["id", "isvalid", "reason", "gradeId", "classId"].includes(key)
    )
    .map((key) => ({
      value: key,
      label: fieldLabelMap[key] || key,
    }));

  // Send feedback email
  const sendFeedbackEmail = async (isValid: boolean) => {
    setSendingFeedback(true);
    let message = "";
    if (isValid) {
      message = `Selamat formulir anda valid, silahkan bawa dokumen2 yang diminta ke sekolah.\n${
        watchedValues.reason || ""
      }`;
    } else {
      const fields = selectedFields.map((f) => f.label).join(", ");
      message = `Tolong kirim ulang kembali PPDB formulir anda karena tidak valid atau ada kesalahan pada: ${fields}.\n${
        watchedValues.reason || ""
      }`;
    }
    try {
      const res = await fetch("/api/send-ppdb-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: watchedValues.email, message }),
      });
      if (res.ok) {
        toast.success("Notifikasi email telah dikirim!");
      } else {
        toast.error("Gagal mengirim notifikasi email.");
      }
    } catch (err) {
      toast.error("Gagal mengirim notifikasi email.");
    } finally {
      setSendingFeedback(false);
    }
  };
  const { grades = [], classes = [] } = relatedData ?? {};

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="border border-gray-300 rounded-lg p-6 shadow-sm bg-white space-y-6 text-black">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium ">Nama Calon Siswa</label>
            <input
              {...register("name")}
              className="w-full border rounded px-3 py-2"
              defaultValue={data?.name}
            />
            {errors.name && (
              <p className="text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            {/* Tempat Lahir */}
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Tempat Lahir</label>
              <input
                {...register("birthPlace")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.birthPlace && (
                <p className="text-red-600">{errors.birthPlace.message}</p>
              )}
            </div>

            {/* Tanggal Lahir */}
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Tanggal Lahir</label>
              <input
                type="date"
                {...register("birthday")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.birthday && (
                <p className="text-red-600">{errors.birthday.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            {/* Jenis Kelamin */}
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Jenis Kelamin</label>
              <select
                {...register("sex")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Pilih</option>
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
              {errors.sex && (
                <p className="text-red-600">{errors.sex.message}</p>
              )}
            </div>

            {/* Agama */}
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Agama</label>
              <select
                {...register("religion")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Pilih</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Buddha">Buddha</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              {errors.religion && (
                <p className="text-red-600">{errors.religion.message}</p>
              )}
            </div>
          </div>

          {/* Asal Sekolah */}
          <div>
            <label className="block mb-1 font-medium">Asal Sekolah</label>
            <input
              {...register("asalSekolah")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.asalSekolah && (
              <p className="text-red-600">{errors.asalSekolah.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            {/* NPSN */}
            <div className="w-1/2">
              <label className="block mb-1 font-medium">NPSN</label>
              <input
                type="text"
                maxLength={8}
                {...register("npsn")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.npsn && (
                <p className="text-red-600">{errors.npsn.message}</p>
              )}
            </div>

            {/* NISN */}
            <div className="w-1/2">
              <label className="block mb-1 font-medium">NISN</label>
              <input
                type="text"
                maxLength={10}
                {...register("nisn")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.nisn && (
                <p className="text-red-600">{errors.nisn.message}</p>
              )}
            </div>
          </div>

          {/* Nomor Seri Ijazah */}
          <div>
            <label className="block mb-1 font-medium">Nomor Seri Ijazah</label>
            <input
              type="text"
              maxLength={12}
              {...register("no_ijz")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.no_ijz && (
              <p className="text-red-600">{errors.no_ijz.message}</p>
            )}
          </div>

          {/* NIK */}
          <div>
            <label className="block mb-1 font-medium">NIK</label>
            <input
              type="text"
              maxLength={20}
              {...register("nik")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.nik && <p className="text-red-600">{errors.nik.message}</p>}
          </div>

          <div className="flex gap-4">
            {/* Alamat */}
            <div className="w-2/3">
              <label className="block mb-1 font-medium">Alamat</label>
              <textarea
                {...register("address")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.address && (
                <p className="text-red-600">{errors.address.message}</p>
              )}
            </div>

            {/* Kode Pos */}
            <div className="w-1/3">
              <label className="block mb-1 font-medium">Kode Pos</label>
              <input
                type="text"
                maxLength={5}
                {...register("postcode")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.postcode && (
                <p className="text-red-600">{errors.postcode.message}</p>
              )}
            </div>
          </div>

          {/* RT */}
          <div className="flex gap-4">
            <div className="w-1/4">
              <label className="block mb-1 font-medium">RT</label>
              <input
                type="text"
                maxLength={2}
                {...register("rt")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.rt && <p className="text-red-600">{errors.rt.message}</p>}
            </div>

            {/* RW */}
            <div className="w-1/4">
              <label className="block mb-1 font-medium">RW</label>
              <input
                type="text"
                maxLength={2}
                {...register("rw")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.rw && <p className="text-red-600">{errors.rw.message}</p>}
            </div>

            {/* Kelurahan */}
            <div className="w-2/4">
              <label className="block mb-1 font-medium">Kelurahan</label>
              <input
                {...register("kelurahan")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.kelurahan && (
                <p className="text-red-600">{errors.kelurahan.message}</p>
              )}
            </div>
          </div>

          {/* Kecamatan */}
          <div className="flex gap-4">
            <div className="w-2/4">
              <label className="block mb-1 font-medium">Kecamatan</label>
              <input
                {...register("kecamatan")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.kecamatan && (
                <p className="text-red-600">{errors.kecamatan.message}</p>
              )}
            </div>

            {/* Kota */}
            <div className="w-2/4">
              <label className="block mb-1 font-medium">Kota</label>
              <input
                {...register("kota")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.kota && (
                <p className="text-red-600">{errors.kota.message}</p>
              )}
            </div>
          </div>

          {/* No. Telepon */}
          <div className="flex gap-4">
            <div className="w-2/4">
              <label className="block mb-1 font-medium">No. Telepon</label>
              <input
                type="text"
                maxLength={11}
                {...register("phone")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.phone && (
                <p className="text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* No. Whatsapp */}
            <div className="w-2/4">
              <label className="block mb-1 font-medium">No. Whatsapp</label>
              <input
                type="text"
                maxLength={13}
                {...register("noWhatsapp")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.noWhatsapp && (
                <p className="text-red-600">{errors.noWhatsapp.message}</p>
              )}
            </div>
          </div>

          {/* Alat Transportasi */}
          <div className="flex gap-4">
            <div className="w-2/4">
              <label className="block mb-1 font-medium">
                Alat Transportasi
              </label>
              <input
                {...register("transportation")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.transportation && (
                <p className="text-red-600">{errors.transportation.message}</p>
              )}
            </div>

            {/* Tempat Tinggal */}
            <div className="w-2/4">
              <label className="block mb-1 font-medium">Tempat Tinggal</label>
              <select
                {...register("tempat_tinggal")}
                className="w-full border rounded px-3 py-2"
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
          </div>

          {/* Email Pribadi */}
          <div>
            <label className="block mb-1 font-medium">Email Pribadi</label>
            <input
              type="email"
              {...register("email")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.email && (
              <p className="text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Penerima KPS */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">
                Penerima KPS (KIP/KIS/KKS)
              </label>
              <select
                {...register("kps")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Pilih --</option>
                <option value="KIP">KIP</option>
                <option value="KIS">KIS</option>
                <option value="KKS">KKS</option>
              </select>
              {errors.kps && (
                <p className="text-red-600">{errors.kps.message}</p>
              )}
            </div>

            {/* Nomor KPS */}
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Nomor KPS</label>
              <input
                {...register("no_kps")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.no_kps && (
                <p className="text-red-600">{errors.no_kps.message}</p>
              )}
            </div>
          </div>

          {/* Tinggi Badan */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">
                Tinggi Badan (cm)
              </label>
              <input
                {...register("height")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.height && (
                <p className="text-red-600">{errors.height.message}</p>
              )}
            </div>

            {/* Berat Badan */}
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Berat Badan (kg)</label>
              <input
                {...register("weight")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.weight && (
                <p className="text-red-600">{errors.weight.message}</p>
              )}
            </div>
          </div>

          {/* Jarak Rumah ke Sekolah */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">
                Jarak ke Sekolah (km)
              </label>
              <input
                {...register("distance_from_home")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.distance_from_home && (
                <p className="text-red-600">
                  {errors.distance_from_home.message}
                </p>
              )}
            </div>

            {/* Waktu Tempuh */}
            <div className="w-1/2">
              <label className="block mb-1 font-medium">
                Waktu Tempuh (menit)
              </label>
              <input
                {...register("time_from_home")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.time_from_home && (
                <p className="text-red-600">{errors.time_from_home.message}</p>
              )}
            </div>
          </div>

          {/* Jumlah Saudara Kandung */}
          <div>
            <label className="block mb-1 font-medium">
              Jumlah Saudara Kandung
            </label>
            <input
              {...register("number_of_siblings")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.number_of_siblings && (
              <p className="text-red-600">
                {errors.number_of_siblings.message}
              </p>
            )}
          </div>

          {/* Prestasi */}

          <div>
            <label className="block mb-1 font-medium">Jenis Prestasi</label>
            <input
              {...register("awards")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.awards && (
              <p className="text-red-600">{errors.awards.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Tingkat Prestasi</label>
              <select
                {...register("awards_lvl")}
                className="w-full border rounded px-3 py-2"
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
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Tahun Prestasi</label>
              <input
                type="date"
                {...register("awards_date")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.awards_date && (
                <p className="text-red-600">{errors.awards_date.message}</p>
              )}
            </div>
          </div>

          {/* Beasiswa */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Beasiswa</label>
              <input
                {...register("scholarship")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.scholarship && (
                <p className="text-red-600">{errors.scholarship.message}</p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Sumber Beasiswa</label>
              <input
                {...register("scholarship_detail")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.scholarship_detail && (
                <p className="text-red-600">
                  {errors.scholarship_detail.message}
                </p>
              )}
            </div>
            <div className="w-1/3">
              <label className="block mb-1 font-medium">Tahun Beasiswa</label>
              <input
                type="date"
                {...register("scholarship_date")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.scholarship_date && (
                <p className="text-red-600">
                  {errors.scholarship_date.message}
                </p>
              )}
            </div>
          </div>

          {/* ==== DATA AYAH ==== */}
          <h2 className="text-lg font-semibold text-center mt-6">
            Data Ayah Kandung
          </h2>

          <div>
            <label className="block mb-1 font-medium">Nama Ayah</label>
            <input
              {...register("namaAyah")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.namaAyah && (
              <p className="text-red-600">{errors.namaAyah.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Tahun Lahir Ayah</label>
              <input
                type="date"
                {...register("tahunLahirAyah")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.tahunLahirAyah && (
                <p className="text-red-600">{errors.tahunLahirAyah.message}</p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Pekerjaan Ayah</label>
              <input
                {...register("pekerjaanAyah")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.pekerjaanAyah && (
                <p className="text-red-600">{errors.pekerjaanAyah.message}</p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Pendidikan Ayah</label>
              <select
                {...register("pendidikanAyah")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Pilih --</option>
                <option value="TIDAK_ADA">Tidak Ada</option>
                <option value="SD">SD/Sederajat</option>
                <option value="SMP">SMP/Sederajat</option>
                <option value="SMA">SMA/Sederajat</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
              {errors.pendidikanAyah && (
                <p className="text-red-600">{errors.pendidikanAyah.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">
                Penghasilan Ayah (Rp)
              </label>
              <input
                {...register("penghasilanAyah")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.penghasilanAyah && (
                <p className="text-red-600">{errors.penghasilanAyah.message}</p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium">No. Telp/HP Ayah</label>
              <input
                {...register("telpAyah")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.telpAyah && (
                <p className="text-red-600">{errors.telpAyah.message}</p>
              )}
            </div>
          </div>

          {/* ==== DATA IBU ==== */}
          <h2 className="text-lg font-semibold text-center mt-6">
            Data Ibu Kandung
          </h2>

          <div>
            <label className="block mb-1 font-medium">Nama Ibu</label>
            <input
              {...register("namaIbu")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.namaIbu && (
              <p className="text-red-600">{errors.namaIbu.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Tahun Lahir Ibu</label>
              <input
                type="date"
                {...register("tahunLahirIbu")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.tahunLahirIbu && (
                <p className="text-red-600">{errors.tahunLahirIbu.message}</p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Pekerjaan Ibu</label>
              <input
                {...register("pekerjaanIbu")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.pekerjaanIbu && (
                <p className="text-red-600">{errors.pekerjaanIbu.message}</p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Pendidikan Ibu</label>
              <select
                {...register("pendidikanIbu")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Pilih --</option>
                <option value="TIDAK_ADA">Tidak Ada</option>
                <option value="SD">SD/Sederajat</option>
                <option value="SMP">SMP/Sederajat</option>
                <option value="SMA">SMA/Sederajat</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
              {errors.pendidikanIbu && (
                <p className="text-red-600">{errors.pendidikanIbu.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">
                Penghasilan Ibu (Rp)
              </label>
              <input
                {...register("penghasilanIbu")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.penghasilanIbu && (
                <p className="text-red-600">{errors.penghasilanIbu.message}</p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium">No. Telp/HP Ibu</label>
              <input
                {...register("telpIbu")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.telpIbu && (
                <p className="text-red-600">{errors.telpIbu.message}</p>
              )}
            </div>
          </div>

          {/* ==== DATA WALI ==== */}
          <h2 className="text-lg font-semibold text-center mt-6">Data Wali</h2>

          <div>
            <label className="block mb-1 font-medium">Nama Wali</label>
            <input
              {...register("namaWali")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.namaWali && (
              <p className="text-red-600">{errors.namaWali.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Tahun Lahir Wali</label>
              <input
                type="date"
                {...register("tahunLahirWali")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.tahunLahirWali && (
                <p className="text-red-600">{errors.tahunLahirWali.message}</p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Pekerjaan Wali</label>
              <input
                {...register("pekerjaanWali")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.pekerjaanWali && (
                <p className="text-red-600">{errors.pekerjaanWali.message}</p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Pendidikan Wali</label>
              <select
                {...register("pendidikanWali")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Pilih --</option>
                <option value="TIDAK_ADA">Tidak Ada</option>
                <option value="SD">SD/Sederajat</option>
                <option value="SMP">SMP/Sederajat</option>
                <option value="SMA">SMA/Sederajat</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
              {errors.pendidikanWali && (
                <p className="text-red-600">{errors.pendidikanWali.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">
                Penghasilan Wali (Rp)
              </label>
              <input
                {...register("penghasilanWali")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.penghasilanWali && (
                <p className="text-red-600">{errors.penghasilanWali.message}</p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium">No. Telp/HP Wali</label>
              <input
                {...register("telpWali")}
                className="w-full border rounded px-3 py-2"
              />
              {errors.telpWali && (
                <p className="text-red-600">{errors.telpWali.message}</p>
              )}
            </div>
          </div>
          {/* ========== Upload Dokumen ========== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium">Fotokopi Ijazah / STTB</label>

              {/* Upload input (only shown if no file yet) */}
              {!dokumen.ijazah &&
                !data?.dokumenIjazah &&
                (uploadingField === "ijazah" ? (
                  <div className="flex items-center justify-center w-full h-10">
                    <svg
                      className="animate-spin h-6 w-6 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span className="ml-2 text-sm text-gray-300">
                      Mengunggah...
                    </span>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileUpload(e, "ijazah")}
                    className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white"
                  />
                ))}

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
              {!dokumen.ijazah && data?.dokumenIjazah && (
                <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
                  <a
                    href={data?.dokumenIjazah}
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
            <div className="flex flex-col gap-2">
              <label className="font-medium">Fotokopi Akte Kelahiran</label>

              {/* Upload input (only shown if no file yet) */}
              {!dokumen.akte &&
                !data?.dokumenAkte &&
                (uploadingField === "akte" ? (
                  <div className="flex items-center justify-center w-full h-10">
                    <svg
                      className="animate-spin h-6 w-6 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span className="ml-2 text-sm text-gray-300">
                      Mengunggah...
                    </span>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileUpload(e, "akte")}
                    className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white"
                  />
                ))}

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
              {!dokumen.akte && data?.dokumenAkte && (
                <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
                  <a
                    href={data?.dokumenAkte}
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
            <div className="flex flex-col gap-2">
              <label className="font-medium ">
                Fotokopi KK, KTP Orang Tua, SKTM / KIP
              </label>

              {/* Upload input (only shown if no file yet) */}
              {!dokumen.kk_ktp_sktm &&
                !data?.dokumenKKKTP &&
                (uploadingField === "kk_ktp_sktm" ? (
                  <div className="flex items-center justify-center w-full h-10">
                    <svg
                      className="animate-spin h-6 w-6 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span className="ml-2 text-sm text-gray-300">
                      Mengunggah...
                    </span>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileUpload(e, "kk_ktp_sktm")}
                    className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white"
                  />
                ))}

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
                      setDokumen((prev) => ({
                        ...prev,
                        kk_ktp_sktm: undefined,
                      }))
                    }
                    className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
                  >
                    Hapus
                  </button>
                </div>
              )}

              {/* Show preview if file exists in DB but not in local state */}
              {!dokumen.kk_ktp_sktm && data?.dokumenKKKTP && (
                <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
                  <a
                    href={data?.dokumenKKKTP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline truncate"
                  >
                    Lihat Dokumen (KK, KTP, SKTM/KIP)
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setDokumen((prev) => ({
                        ...prev,
                        kk_ktp_sktm: undefined,
                      }))
                    }
                    className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Foto Siswa</label>

              {/* Upload input */}
              {!dokumen.pasfoto &&
                !data?.dokumenPasfoto &&
                (uploadingField === "pasfoto" ? (
                  <div className="flex items-center justify-center w-full h-10">
                    <svg
                      className="animate-spin h-6 w-6 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span className="ml-2 text-sm text-gray-300">
                      Mengunggah...
                    </span>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileUpload(e, "pasfoto")}
                    className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white"
                  />
                ))}

              {/* Local preview */}
              {dokumen.pasfoto && (
                <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
                  <a
                    href={dokumen.pasfoto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline truncate"
                  >
                    Lihat Foto Siswa
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setDokumen((prev) => ({ ...prev, pasfoto: undefined }))
                    }
                    className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
                  >
                    Hapus
                  </button>
                </div>
              )}

              {/* DB preview */}
              {!dokumen.pasfoto && data?.dokumenPasfoto && (
                <div className="flex items-center justify-between bg-white/10 p-2 rounded shadow">
                  <a
                    href={data?.dokumenPasfoto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline truncate"
                  >
                    Lihat Foto Siswa
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setDokumen((prev) => ({ ...prev, pasfoto: undefined }))
                    }
                    className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          </div>

          {type === "update" && (
            <div className="flex-row gap-4">
              {/* Validasi */}
              <div className="w-full">
                <label className="flex items-center gap-2 mt-10 mb-10">
                  <input
                    type="checkbox"
                    {...register("isvalid")}
                    className="w-4 h-4"
                  />
                  Formulir Valid?
                </label>
                {errors.isvalid && (
                  <p className="text-red-600">{errors.isvalid.message}</p>
                )}
                {/* Email feedback section */}
                {watchedValues.isvalid ? (
                  <div>
                    <div className="flex flex-row gap-4 mb-2">
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-xs text-gray-400 mb-1 block">
                          Tingkat
                        </label>
                        <select
                          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                          {...register("gradeId")}
                          defaultValue={data?.gradeId}
                        >
                          {grades.map(
                            (grade: { id: number; level: number }) => (
                              <option value={grade.id} key={grade.id}>
                                {grade.level}
                              </option>
                            )
                          )}
                        </select>
                        {errors.gradeId?.message && (
                          <p className="text-xs text-red-400 mt-1">
                            {errors.gradeId.message.toString()}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 min-w-[180px]">
                        <label className="text-xs text-gray-400 mb-1 block">
                          Kelas
                        </label>
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
                                {kelas.name} -{" "}
                                {kelas._count.students + "/" + kelas.capacity}{" "}
                                Kapasitas
                              </option>
                            )
                          )}
                        </select>
                        {errors.classId?.message && (
                          <p className="text-xs text-red-400 mt-1">
                            {errors.classId.message.toString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white mb-2"
                      disabled={sendingFeedback}
                      onClick={() => sendFeedbackEmail(true)}
                    >
                      {sendingFeedback
                        ? "Mengirim..."
                        : "Kirim Notifikasi Valid ke Email"}
                    </button>
                  </div>
                ) : (
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">
                      Pilih field yang salah (bisa lebih dari satu):
                    </label>
                    <Select
                      isMulti
                      options={fieldOptions}
                      value={selectedFields}
                      onChange={(newValue) => setSelectedFields([...newValue])}
                      className="mb-2"
                    />
                    <button
                      type="button"
                      className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white"
                      disabled={sendingFeedback}
                      onClick={() => sendFeedbackEmail(false)}
                    >
                      {sendingFeedback
                        ? "Mengirim..."
                        : "Kirim Notifikasi Tidak Valid ke Email"}
                    </button>
                  </div>
                )}
                <label className="block mb-1 font-medium">
                  Pesan tambahan Bagi calon siswa
                </label>
                <textarea
                  {...register("reason")}
                  className="w-full border rounded px-3 py-2 h-[90px]"
                />
                {errors.reason && (
                  <p className="text-red-600">{errors.reason.message}</p>
                )}
              </div>
            </div>
          )}

          {data?.id && (
            <input hidden type="number" {...register("id")} value={data.id} />
          )}
          {errors.id && <p className="text-red-600">{errors.id.message}</p>}

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
          {/* Tombol Submit */}
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
                ? "Kirim Pendaftaraan"
                : "Update dan Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormulirPendaftaran;
