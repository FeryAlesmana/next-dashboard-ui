export const cloudinaryUpload = async (file: File, folder = "ppdb") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "SMPI SERUA"); // Replace with your real preset
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  const data = await res.json();
  return data.secure_url;
};
