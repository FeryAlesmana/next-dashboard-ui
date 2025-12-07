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
  const isPaymentLog = table === "paymentLog";
  
  // Separate onChange from other inputProps to avoid conflicts
  const { onChange: customOnChange, ...restInputProps } = inputProps || {};

  return (
    <div
      className={`flex flex-col gap-2 w-full ${
        table !== "student" &&
        table !== "parent" &&
        table !== "teacher" &&
        table !== "paymentLog"
          ? "md:w-1/4"
          : ""
      } ${hidden ? "hidden" : ""}`}
    >
      <label className="text-xs text-gray-400">{label}</label>
      {isPaymentLog && type === "number" && (
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min={1}
          {...register(name)}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={`border rounded p-2 w-full disabled:bg-gray-200 disabled:cursor-not-allowed ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          {...restInputProps}
          onChange={(e) => {
            // Call react-hook-form's onChange first
            const registered = register(name);
            if (registered.onChange) {
              registered.onChange(e);
            }
            // Then call custom onChange if provided
            if (customOnChange) {
              customOnChange(e);
            }
          }}
        />
      )}

      {isPaymentLog && type === "date" && (
        <input
          type="date"
          {...register(name)}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={`border rounded p-2 w-full disabled:bg-gray-200 disabled:cursor-not-allowed ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          {...restInputProps}
          onChange={(e) => {
            // Call react-hook-form's onChange first
            const registered = register(name);
            if (registered.onChange) {
              registered.onChange(e);
            }
            // Then call custom onChange if provided
            if (customOnChange) {
              customOnChange(e);
            }
          }}
        />
      )}

      {/* NORMAL FIELD FOR EVERYTHING ELSE */}
      {!isPaymentLog && (
        <>
          {type === "textarea" ? (
            <textarea
              {...register(name)}
              placeholder={placeholder}
              defaultValue={defaultValue}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm resize-y"
              {...inputProps}
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
              defaultValue={defaultValue}
              className={`ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full ${
                error ? "border-red-500 ring-red-300" : ""
              }`}
              {...inputProps}
              min={type === "number" ? 0 : undefined}
            />
          )}
        </>
      )}

      {error?.message && (
        <p className="text-xs text-red-400">{error?.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
