"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type slideHero = {
  id: number;
  imageUrl: string;
};

const HeroSettings = () => {
  const [hero, setHero] = useState<slideHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    const res = await fetch("/api/homepage-data");
    const data = await res.json();
    setHero(data.heroSlides);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const uploaded: { imageUrl: string }[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "SMPI SERUA");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: "POST", body: formData }
      );

      const uploadData = await uploadRes.json();

      uploaded.push({
        imageUrl: uploadData.secure_url,
      });
    }

    await fetch("/api/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: uploaded }),
    });

    fetchHero();
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await fetch("/api/hero", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchHero();
    setDeletingId(null);
  };

  if (loading)
    return (
      <section className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <h2 className="text-lg font-bold mb-2">Gallery</h2>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border rounded p-2 animate-pulse bg-gray-100 h-32"
            />
          ))}
        </div>
      </section>
    );

  return (
    <section className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h2 className="text-lg font-bold mb-2">Hero</h2>
      <div className="flex items-center gap-4">
        {uploading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            Uploading...
          </div>
        ) : (
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        )}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-4">
        {hero.length === 0 ? (
          <div className="col-span-4 flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded bg-gray-50 text-gray-500">
            Belum ada gambar untuk Komponen ini
          </div>
        ) : (
          hero.map((item) => (
            <div key={item.id} className="border rounded p-2 relative">
              {deletingId === item.id ? (
                <div className="w-full h-24 bg-gray-200 animate-pulse rounded" />
              ) : (
                <Image
                  src={item.imageUrl}
                  alt="hero"
                  className="w-full h-24 object-cover rounded"
                  width={160}
                  height={160}
                />
              )}

              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default HeroSettings;
