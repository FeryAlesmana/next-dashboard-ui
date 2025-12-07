import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

type InstallmentFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
};

export default function InstallmentField({
  label,
  type = "text",
  register,
  name,
  error,
}: InstallmentFieldProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium">{label}</label>

      <input
        type={type}
        {...register(name)}
        className={`border px-3 py-2 rounded ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      {error?.message && (
        <p className="text-xs text-red-500">{error.message.toString()}</p>
      )}
    </div>
  );
}
