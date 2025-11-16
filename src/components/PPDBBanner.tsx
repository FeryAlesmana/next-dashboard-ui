export default function PPDBBanner({ reason }: { reason: string }) {
  const message = {
    NOT_STARTED: "Pendaftaran PPDB belum dibuka.",
    ENDED: "Pendaftaran PPDB telah ditutup.",
    QUOTA_FULL: "Kuota PPDB sudah penuh.",
    SETTING_NOT_FOUND: "Pengaturan PPDB tidak ditemukan."
  }[reason];

  return (
    <div className="bg-red-600 text-white p-4 rounded-lg text-center mb-4">
      {message || "PPDB tidak tersedia saat ini."}
    </div>
  );
}
