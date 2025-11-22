"use client";

import { useState } from "react";
import { cloudinaryUpload } from "@/lib/upload/cloudinaryUpload";
import Image from "next/image";
import crypto from "crypto";
export default function UploadTest() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const ALGORITHM = "aes-256-cbc";
  const SECRET_KEY = crypto
    .createHash("sha256")
    .update("SMP1_S3RU4_Islamiyah")
    .digest();
  const IV_LENGTH = 16;

  // Encrypt password
  function encryptPassword(password: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let encrypted = cipher.update(password, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  }

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
      <h1>{encryptPassword("11223344556677889900@AYAH")}</h1>
    </div>
  );
}

// <div className="mt-6">
//   <div className="space-y-4">
//     {Array.from({ length: 5 }).map((_, idx) => (
//       <div
//         key={idx}
//         className="grid grid-cols-6 gap-4 items-center p-4 border-b border-gray-200"
//       >
//         <div className="col-span-1 h-4 bg-gray-300 rounded"></div>
//         <div className="col-span-1 h-4 bg-gray-300 rounded"></div>
//         <div className="col-span-1 h-4 bg-gray-300 rounded hidden md:block"></div>
//         <div className="col-span-1 h-4 bg-gray-300 rounded hidden md:block"></div>
//         <div className="col-span-1 h-4 bg-gray-300 rounded hidden md:block"></div>
//       </div>
//     ))}
//   </div>
// </div>;
