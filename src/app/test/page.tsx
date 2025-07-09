"use client";

import { useState } from "react";
import { cloudinaryUpload } from "@/lib/upload/cloudinaryUpload";
import Image from "next/image";

export default function UploadTest() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await cloudinaryUpload(file, "ppdb");
      setUrl(result);
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4 bg-white max-w-md mx-auto mt-10 rounded-lg shadow">
      <h1 className="text-xl font-bold">Test Upload Dokumen</h1>
      <input
        type="file"
        onChange={handleUpload}
        className="border p-2 rounded"
      />
      {loading && <p>Uploading...</p>}
      {url && (
        <div>
          <p>Upload Success!</p>
          <Image
            src={url}
            alt="Uploaded"
            className="w-32 mt-2 rounded"
            width={400}
            height={400}
          />
          <p className="text-sm break-all mt-2">{url}</p>
        </div>
      )}
    </div>
  );
}
