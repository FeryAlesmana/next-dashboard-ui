import Image from "next/image";

export const Preview = ({ fileUrl }: { fileUrl: string }) => {
  if (!fileUrl) return null;

  const isPdf = fileUrl.endsWith(".pdf");

  return (
    <div className="mt-2">
      <p className="text-sm text-white mb-1">Preview:</p>
      {isPdf ? (
        <iframe
          src={fileUrl}
          className="w-full h-64 border rounded bg-white"
          title="File preview"
        />
      ) : (
        <Image
          width={500}
          height={400}
          src={fileUrl}
          alt="Uploaded file"
          className="w-32 h-auto rounded shadow border"
        />
      )}
    </div>
  );
};
