"use client";
import NavbarHome from "@/components/NavbarHome";
import { FaSchool, FaLaptop, FaPrint } from "react-icons/fa";
import { useRef, useState } from "react";
import FormModal from "@/components/FormModal";
import { EmailVerificationGate } from "@/components/EmailVerificationGate";

export default function PPDBPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const [selectedMethod, setSelectedMethod] = useState<
    "offline" | "online" | null
  >(null);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative font-sans min-h-screen">
      {/* Background Gradient & Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-orange-400 opacity-90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ0cmFuc3BhcmVudCIgLz4KPHBhdHRlcm4gaWQ9InBhdHRlcm4iIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj4KPHBhdGggZD0iTTAgMEwxMDAgMTAwTTEwMCAwTDAgMTAwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEiIC8+CjwvcGF0dGVybj4KPHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgLz4KPC9zdmc+')]"></div>
        </div>
      </div>

      {/* Main Content */}
      <NavbarHome />
      <div className="pt-32 max-w-4xl mx-auto px-4 text-white">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
          Penerimaan Peserta Didik Baru (PPDB)
        </h1>

        <div className="flex flex-col md:flex-row gap-8 items-start md:items-stretch justify-center">
          {/* Offline Card */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border-l-4 border-orange-300 shadow-md hover:shadow-lg transition md:w-[100%] lg:w-[75%] xl:w-[100%]">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <FaSchool className="text-orange-300" />
              Metode Offline
            </h2>
            <ul className="list-disc list-inside text-lg space-y-1">
              <li>Mengisi formulir pendaftaran</li>
              <li>Lulus SD/MI</li>
              <li>Fotokopi ijazah/STTB legalisir</li>
              <li>Fotokopi akte kelahiran</li>
              <li>Pas foto 3x4 & 2x3 (4 lembar)</li>
              <li>Fotokopi KK, KTP Orang Tua, & SKTM/KIP (jika ada)</li>
            </ul>
            <button
              onClick={() => setSelectedMethod("offline")}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full flex items-center gap-2"
            >
              <FaPrint /> Download Formulir
            </button>
          </div>

          {/* Online Card */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border-l-4 border-blue-400 shadow-md hover:shadow-lg transition md:w-[100%] lg:w-[75%] xl:w-[100%]">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <FaLaptop className="text-blue-300" />
              Metode Online
            </h2>
            <ul className="list-disc list-inside text-lg space-y-1">
              <li>Isi email valid</li>
              <li>Validasi email & klik link/masukkan OTP</li>
              <li>Isi Formulir dan Unggah dokumen yang dibutuhkan</li>
              <li>Tekan tombol submit</li>
              <li>Tunggu validasi Formulir dari email</li>
              <li>Jika Valid Bawa dokumen dan foto-foto yang di perlukan</li>
            </ul>
            <button
              onClick={() => {
                setSelectedMethod("online");
                scrollToForm();
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>

        {/* Dynamic Action Section */}
        {selectedMethod === "offline" && (
          <div className="mt-8 text-center">
            <a
              href="/files/FORMULIR-PENERIMAAN-MAHASISWA-BARU-TAHUN-2023.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full shadow-lg"
            >
              Unduh Formulir Offline (PDF)
            </a>
          </div>
        )}

        {/* Placeholder for Online Form */}
        {selectedMethod === "online" && (
          <div
            ref={formRef}
            className="mt-12 bg-white/30 p-6 rounded-xl shadow-md backdrop-blur-md"
          >
            <h3 className="text-xl font-semibold mb-4 text-white">
              Formulir Pendaftaran Online
            </h3>
            <EmailVerificationGate />
          </div>
        )}
      </div>
    </div>
  );
}
