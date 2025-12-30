"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import HeroSettings from "@/components/HeroSettingComp";
import EskulSettings from "@/components/EskulSettingComp";
import LoadingScreen from "@/components/LoadingScreen";
import { HomeSetting, PPDBSetting } from "@prisma/client";
import PPDBSettingForm from "@/components/forms/PPDBSettingForm";
import CreditSettingForm from "@/components/forms/CreditSettingForm";

type GalleryImage = {
  id: number;
  imageUrl: string;
  caption?: string;
};
const Settings = () => {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [psetting, setPsetting] = useState<PPDBSetting[]>([]);
  const [csetting, setCsetting] = useState<HomeSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [gloading, setgLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const resizeImage = (
    file: File,
    maxSize = 1080,
    quality = 0.8
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();

      const reader = new FileReader();

      reader.onload = () => {
        img.src = reader.result as string;
      };

      img.onload = () => {
        let { width, height } = img;

        // Maintain aspect ratio
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas error");

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("Compression failed");

            resolve(
              new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: "image/jpeg",
              })
            );
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = reject;
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/homepage-data`);
      const data = await res.json();
      setGallery(data.gallery);
      setPsetting(data.ppdbSettings);
      setCsetting(data.creditSetting);
      setgLoading(false);
    } catch (err) {
      console.error("Failed to load homepage data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

      await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: uploaded }),
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
      setTotalFiles(0);
    }
  };

  const handleCaptionSave = async (id: number, caption: string) => {
    setSavingId(id);
    await fetch(`/api/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption }),
    });
    await fetchData();
    setEditingId(null);
    setSavingId(null);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await fetch("/api/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
    setDeletingId(null);
  };

  if (loading) return <LoadingScreen />;
  if (gloading) {
    return (
      <section className="p-6">
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
  }

  return (
    <div className="space-y-10 p-6">
      <h1 className="hidden md:block text-lg font-semibold">
        Pengaturan Home Page
      </h1>
      {/* Hero Section */}
      <HeroSettings resizeImage={resizeImage} />

      {/* Gallery */}
      <section className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <h2 className="text-lg font-bold mb-2">Gallery</h2>
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
              onChange={handleGalleryUpload}
              disabled={uploading}
            />
          )}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {gallery.length === 0 ? (
            <div className="col-span-4 flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded bg-gray-50 text-gray-500">
              Belum ada Item untuk Komponen ini
            </div>
          ) : (
            gallery.map((item) => (
              <div key={item.id} className="border rounded p-2 relative">
                {deletingId === item.id ? (
                  <div className="w-full h-24 bg-gray-200 animate-pulse rounded" />
                ) : (
                  <Image
                    src={item.imageUrl}
                    alt={item.caption ?? "gallery"}
                    className="w-full h-48 object-contain rounded bg-gray-100"
                    width={400}
                    height={400}
                    unoptimized
                  />
                )}

                <div className="mt-2 text-center">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      defaultValue={item.caption ?? ""}
                      autoFocus
                      className="border rounded px-2 py-1 w-full text-sm"
                      onBlur={(e) =>
                        handleCaptionSave(item.id, e.target.value.trim())
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCaptionSave(
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
                        : item.caption || "Add caption"}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Eskul */}
      <EskulSettings resizeImage={resizeImage} />
      <section>
        <PPDBSettingForm type="update" data={psetting} />
      </section>
      <section>
        <CreditSettingForm data={csetting} />
      </section>
    </div>
  );
};

export default Settings;
