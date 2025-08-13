import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
  hidden?: boolean;
  placeholder?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  table?:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "ppdb"
    | "paymentLog";
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  placeholder,
  inputProps,
  hidden,
  table,
}: InputFieldProps) => {
  return (
    <div
      className={`flex flex-col gap-2 w-full ${
        table !== "student" && table !== "parent" && table !== "teacher"
          ? "md:w-1/4"
          : ""
      } ${hidden ? "hidden" : ""}`}
    >
      <label className="text-xs text-gray-400">{label}</label>
      {type === "textarea" ? (
        <textarea
          {...register(name)}
          placeholder={placeholder}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm resize-y"
          {...inputProps}
          defaultValue={defaultValue}
        />
      ) : (
        <input
          type={type}
          {...register(name, {
            min:
              type === "number"
                ? { value: 0, message: "Value cannot be negative" }
                : undefined,
          })}
          placeholder={placeholder}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...inputProps}
          defaultValue={defaultValue}
          min={type === "number" ? 0 : undefined}
        />
      )}

      {error?.message && (
        <p className="text-xs text-red-400">{error?.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
