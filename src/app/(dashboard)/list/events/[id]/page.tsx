// app/events/[id]/page.tsx
import prisma from "@/lib/prisma";
import Image from "next/image";

const EventDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id: Number(id) },
    include: { class: true },
  });

  if (!event) return <p>Event not found</p>;

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 bg-white rounded-lg shadow-md">
      {event.img && (
        <div className="w-full mb-4 relative h-64">
          <Image
            src={event.img}
            alt={event.title}
            fill
            className="object-cover rounded-md border"
          />
        </div>
      )}
      {/* Title */}
      <h1 className="text-2xl font-bold text-lamaPurple mb-2">{event.title}</h1>

      {/* Class */}
      <p className="text-sm text-gray-500 mb-4">
        Kelas:{" "}
        <span className="font-medium text-gray-700">
          {event.class?.name || "-"}
        </span>
      </p>

      {/* Description */}
      <p className="text-gray-700 leading-relaxed mb-6">{event.description}</p>

      {/* Date & Time */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Mulai:</span>{" "}
          {new Intl.DateTimeFormat("id-ID", {
            dateStyle: "full",
            timeStyle: "short",
          }).format(event.startTime)}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-medium">Selesai:</span>{" "}
          {new Intl.DateTimeFormat("id-ID", {
            dateStyle: "full",
            timeStyle: "short",
          }).format(event.endTime)}
        </p>
      </div>
    </div>
  );
};

export default EventDetailPage;
