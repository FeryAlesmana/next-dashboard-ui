import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  placeholder?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
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
}: InputFieldProps) => {
  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-2 w-full md:w-1/4"}>
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
          {...register(name)}
          placeholder={placeholder}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...inputProps}
          defaultValue={defaultValue}
        />
      )}
      {/* <input
        type={type}
        {...register(name)}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        {...inputProps}
        defaultValue={defaultValue}
      /> */}
      {error?.message && (
        <p className="text-xs text-red-400">{error?.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
