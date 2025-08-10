import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

type UploadPreviewProps = {
  imageUrl?: string;
  onUpload: (url: string) => void;
};

const UploadPhoto = ({ imageUrl, onUpload }: UploadPreviewProps) => {
  return (
    <CldUploadWidget
      uploadPreset="SMPI SERUA"
      onSuccess={(result, { widget }) => {
        const info = result?.info as { secure_url?: string };
        if (info?.secure_url) {
          onUpload(info.secure_url);
        }
        widget.close();
      }}
    >
      {({ open }) => (
        <div className="space-y-2">
          {imageUrl && (
            <div className="flex items-center gap-4">
              <Image
                src={imageUrl}
                alt="Preview"
                width={80}
                height={80}
                className="rounded shadow border"
              />
              <button
                type="button"
                onClick={() => typeof open === "function" && open()}
                className="text-blue-500 hover:underline text-sm"
              >
                Ganti Foto
              </button>
            </div>
          )}

          {!imageUrl && (
            <div
              className="text-xs text-gray-400 flex items-center p-16 gap-2 cursor-pointer"
              onClick={() => typeof open === "function" && open()}
            >
              <Image src="/upload.png" alt="" width={28} height={28} />
              <span>Upload photo</span>
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
};

export default UploadPhoto;
