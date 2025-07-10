"use client";
import React, {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PpdbSchema, ppdbSchema } from "@/lib/formValidationSchema";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createPpdb, CurrentState, updatePpdb } from "@/lib/actions";
import { cloudinaryUpload } from "@/lib/upload/cloudinaryUpload";
import { Preview } from "../preview";

const FORM_KEY = "ppdb_draft_form";

const FormulirPendaftaran = ({
  data,
  type,
  relatedData,
  setOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  data?: any;
  type: "create" | "update";
  relatedData: any;
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PpdbSchema>({
    resolver: zodResolver(ppdbSchema),
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
  }, [setValue]);

  const [dokumen, setDokumen] = useState<{
    ijazah?: string;
    akte?: string;
    pasfoto?: string;
    kk_ktp_sktm?: string;
  }>({});
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

  const onSubmit = handleSubmit((data) => {
    startTransition(() => {
      console.log(data);
      formAction({
        ...data,
        dokumenIjazah: dokumen.ijazah,
        dokumenAkte: dokumen.akte,
        dokumenPasfoto: dokumen.pasfoto,
        dokumenKKKTP: dokumen.kk_ktp_sktm,
      });
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      localStorage.removeItem(FORM_KEY);
      toast(
        `PPDB telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      router.refresh();
    }
  }, [state, type, router]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Formulir Pendaftaran Peserta Didik
        </h1>
        <a
          href="/"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Kembali ke Halaman Utama
        </a>
      </div>

      <div className="border border-gray-300 rounded-lg p-6 shadow-sm bg-white space-y-6 text-black">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium ">Nama Calon Siswa</label>
            <input
              {...register("name")}
              className="w-full border rounded px-3 py-2"
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
                <option value="Budha">Budha</option>
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
                <option value="kabupaten/Kota">Kabupaten/Kota</option>
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
          <div>
            <label className="font-medium block mb-1 ">
              Fotokopi Ijazah / STTB
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileUpload(e, "ijazah")}
              className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white"
            />
            {dokumen.ijazah && <Preview fileUrl={dokumen.ijazah} />}
          </div>

          <div>
            <label className="font-medium block mb-1 ">
              Fotokopi Akte Kelahiran
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileUpload(e, "akte")}
              className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white"
            />
            {dokumen.akte && <Preview fileUrl={dokumen.akte} />}
          </div>

          <div>
            <label className="font-medium block mb-1 ">
              Foto Background warna merah
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, "pasfoto")}
              className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white"
            />
            {dokumen.pasfoto && <Preview fileUrl={dokumen.pasfoto} />}
          </div>

          <div>
            <label className="font-medium block mb-1 ">
              Fotokopi KK, KTP Orang Tua, SKTM / KIP
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileUpload(e, "kk_ktp_sktm")}
              className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white"
            />
            {dokumen.kk_ktp_sktm && <Preview fileUrl={dokumen.kk_ktp_sktm} />}
          </div>

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
          <div className="text-center pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700"
            >
              Kirim Pendaftaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormulirPendaftaran;
