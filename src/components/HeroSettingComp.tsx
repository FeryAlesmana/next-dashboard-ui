"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type slideHero = {
  id: number;
  imageUrl: string;
};

const HeroSettings = ({
  resizeImage,
}: {
  resizeImage: (file: File, maxSize: number, quality: number) => Promise<File>;
}) => {
  const [hero, setHero] = useState<slideHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    const res = await fetch("/api/homepage-data");
    const data = await res.json();
    setHero(data.heroSlides);
    setLoading(false);
  };

  const uploadSingleFile = async (file: File, onProgress: () => void) => {
    const resizedFile = await resizeImage(file, 1080, 0.8);

    const formData = new FormData();
    formData.append("file", resizedFile);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();

    onProgress();

    return {
      imageUrl: data.secure_url,
      name: file.name.replace(/\.[^/.]+$/, ""),
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setTotalFiles(files.length);

    let uploadedCount = 0;

    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadSingleFile(file, () => {
          uploadedCount++;
          setProgress(Math.round((uploadedCount / files.length) * 100));
        })
      );

      const uploaded = await Promise.all(uploadPromises);

      await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: uploaded }),
      });

      await fetchHero();
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
      setTotalFiles(0);
    }
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
        <h2 className="text-lg font-bold mb-2">Hero Slide</h2>
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
      <h2 className="text-lg font-bold mb-2">Hero Slide</h2>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {uploading ? (
          <>
            <div className="text-sm text-gray-600">
              Uploading {progress}% ({totalFiles} files)
            </div>

            <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
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
                  className="w-full h-48 object-contain rounded bg-gray-100"
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
