"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import HeroSettings from "@/components/HeroSettingComp";
import EskulSettings from "@/components/EskulSettingComp";
import LoadingScreen from "@/components/LoadingScreen";

type HomepageData = {
  heroSlides: { id: number; url: string }[];
  gallery: { id: number; imageUrl: string; caption?: string }[];
  eskul: { id: number; name: string; imageUrl: string }[];
  penunjang: { id: number; name: string; imageUrl: string }[];
};
type GalleryImage = {
  id: number;
  imageUrl: string;
  caption?: string;
};
const Settings = () => {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [gloading, setgLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/homepage-data`);
      const data = await res.json();
      setGallery(data.gallery);
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
    if (!files) return;
    setUploading(true);
    const uploaded: { imageUrl: string; caption?: string }[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", `${process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}`);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: "POST", body: formData }
      );

      const uploadData = await uploadRes.json();
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      uploaded.push({
        imageUrl: uploadData.secure_url,
        caption: nameWithoutExt, // optional, you can change later
      });
    }

    await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: uploaded }),
    });

    fetchData();

    setUploading(false);
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
      <HeroSettings />

      {/* Gallery */}
      <section className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <h2 className="text-lg font-bold mb-2">Gallery</h2>
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
      <EskulSettings />
    </div>
  );
};

export default Settings;
