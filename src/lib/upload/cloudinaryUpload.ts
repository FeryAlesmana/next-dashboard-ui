export const cloudinaryUpload = async (file: File, folder = "ppdb") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "SMPI SERUA"); // Your preset
  formData.append("folder", folder);

  // Pick resource type based on file type
  let resourceType: "image" | "video" | "raw" = "image";
  if (
    file.type.includes("pdf") ||
    file.type.includes("zip") ||
    file.type.includes("msword")
  ) {
    resourceType = "raw";
  } else if (file.type.startsWith("video/")) {
    resourceType = "video";
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.secure_url;
};
