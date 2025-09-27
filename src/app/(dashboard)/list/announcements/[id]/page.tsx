// app/events/[id]/page.tsx
import prisma from "@/lib/prisma";

const AnnouncementDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const announcement = await prisma.announcement.findUnique({
    where: { id: Number(id) },
    include: { class: true },
  });

  if (!announcement) return <p>Announcement not found</p>;

  if (!announcement)
    return (
      <p className="text-center text-gray-500">Pengumuman tidak ditemukan</p>
    );

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 bg-white rounded-lg shadow-md">
      {/* Title */}
      <h1 className="text-2xl font-bold text-lamaPurple mb-2">
        {announcement.title}
      </h1>

      {/* Class */}
      <p className="text-sm text-gray-500 mb-4">
        Kelas:{" "}
        <span className="font-medium text-gray-700">
          {announcement.class?.name || "-"}
        </span>
      </p>

      {/* Description */}
      <p className="text-gray-700 leading-relaxed mb-6">
        {announcement.description}
      </p>

      {/* Date */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Tanggal:</span>{" "}
          {new Intl.DateTimeFormat("id-ID", {
            dateStyle: "full",
          }).format(announcement.date)}
        </p>
      </div>
    </div>
  );
};

export default AnnouncementDetailPage;
