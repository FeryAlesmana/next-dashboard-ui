"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type EskulSchema = {
  name: string;
  imageUrl: string;
  id: number;
};

const EskulSettings = ({
  resizeImage,
}: {
  resizeImage: (file: File, maxSize: number, quality: number) => Promise<File>;
}) => {
  const [eskul, setEskul] = useState<EskulSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

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

  useEffect(() => {
    fetchEskul();
  }, []);

  const fetchEskul = async () => {
    const res = await fetch("/api/homepage-data");
    const data = await res.json();
    setEskul(data.eskul);
    setLoading(false);
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

      await fetch("/api/eskul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: uploaded }),
      });

      await fetchEskul();
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
      setTotalFiles(0);
    }
  };

  const handleNameSave = async (id: number, name: string) => {
    setSavingId(id);
    await fetch(`/api/eskul/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await fetchEskul();
    setEditingId(null);
    setSavingId(null);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await fetch("/api/eskul", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchEskul();
    setDeletingId(null);
  };

  if (loading)
    return (
      <section className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <h2 className="text-lg font-bold mb-2">Eskul</h2>
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
      <h2 className="text-lg font-bold mb-2">Eskul</h2>
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
        {eskul.length === 0 ? (
          <div className="col-span-4 flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded bg-gray-50 text-gray-500">
            Belum ada Item untuk Komponen ini
          </div>
        ) : (
          eskul.map((item) => (
            <div key={item.id} className="border rounded p-2 relative">
              {deletingId === item.id ? (
                <div className="w-full h-24 bg-gray-200 animate-pulse rounded" />
              ) : (
                <Image
                  src={item.imageUrl}
                  alt={"hero"}
                  className="w-full h-48 object-contain rounded bg-gray-100"
                  width={160}
                  height={160}
                  unoptimized
                />
              )}
              <div className="mt-2 text-center">
                {editingId === item.id ? (
                  <input
                    type="text"
                    defaultValue={item.name ?? ""}
                    autoFocus
                    className="border rounded px-2 py-1 w-full text-sm"
                    onBlur={(e) =>
                      handleNameSave(item.id, e.target.value.trim())
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleNameSave(
                          item.id,
                          (e.target as HTMLInputElement).value.trim()
                        );
                      }
                    }}
                  />
                ) : (
                  <p
                    className="text-sm cursor-pointer"
                    onClick={() => setEditingId(item.id)}
                  >
                    {savingId === item.id
                      ? "Saving..."
                      : item.name || "Add name"}
                  </p>
                )}
              </div>

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

export default EskulSettings;
