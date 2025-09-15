"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  createClass,
  createUser,
  CurrentState,
  updateClass,
  updateUser,
} from "@/lib/actions";
import {
  classSchema,
  ClassSchema,
  userSchema,
  UserSchema,
} from "@/lib/formValidationSchema";
import ConfirmDialog from "../ConfirmDialog";
import Select from "react-select";
import { BaseFormProps } from "./AssignmentForm";

const UserForm = ({
  setOpen,
  type,
  data,
  relatedData,
  onChanged,
}: BaseFormProps) => {
  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
  } = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
  });

  const createUserHandler = async (
    prevState: CurrentState,
    payload: UserSchema
  ): Promise<CurrentState> => {
    return await createUser(prevState, payload);
  };

  const updateUserHandler = async (
    prevState: CurrentState,
    payload: UserSchema
  ): Promise<CurrentState> => {
    return await updateUser(prevState, payload);
  };

  const [state, formAction] = useActionState(
    type === "create" ? createUserHandler : updateUserHandler,
    {
      success: false,
      error: false,
      message: "",
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<UserSchema | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!state.success && !state.error) return;
    setIsSubmitting(false);
  }, [state.success, state.error]);

  const handleSubmitForm = () => {
    if (!formData) return;
    setIsSubmitting(true);
    startTransition(() => {
      formAction(formData);
    });
    setShowConfirm(false);
  };

  // Ubah onSubmit agar cek validasi dulu sebelum set showConfirm
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await trigger();
    if (valid) {
      handleSubmit((data) => {
        setFormData(data);
        setShowConfirm(true);
      })();
    } else {
      setShowConfirm(false);
    }
  };

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const updatedItem = state.data ?? formData;
      toast(
        `User telah berhasil di ${type === "create" ? "Tambah!" : "Edit!"}`
      );
      // if (onChanged && updatedItem) {
      //   onChanged(updatedItem); // 🔥 notify parent so it can update localData
      // } else {
      //   router.refresh(); // fallback if no handler passed
      // }
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router, onChanged, formData]);

  const { foundUser, usersData = [] } = relatedData ?? {};

  const usersOptions = usersData.map((user: any) => ({
    value: user.id,
    label: `${user.name} - ${user.type}`,
  }));

  return (
    <>
      {showConfirm && (
        <ConfirmDialog
          message={type === "create" ? "Tambah User baru?" : "Ubah User?"}
          onConfirm={handleSubmitForm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Tambah User baru" : "Edit User"}
        </h1>
        <span className="text-xs text-gray-400 font-medium">
          Informasi Kelas
        </span>
        <span className="text-xs text-gray-400 font-medium">
          Informasi Autentikasi
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <div>
            <InputField
              label="Username"
              name="username"
              defaultValue={data?.name}
              register={register}
              error={errors?.username}
              table="student"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <InputField
              label="Email"
              name="email"
              type="email"
              defaultValue={data?.email}
              register={register}
              placeholder="email@example.com"
              error={errors?.email}
              table="student"
            />
          </div>

          <div>
            <InputField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              defaultValue={data?.password}
              register={register}
              error={errors?.password}
              table="student"
              placeholder="Isi password"
            />
            <label className="flex items-center gap-2 mt-1 text-xs">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              Show password
            </label>
          </div>
        </div>
        <div className="flex justify-center flex-wrap gap-4 gap-x-20">
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-400">Jenis Role</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("role")}
              defaultValue={data?.role}
            >
              <option value="">Pilih Role</option>
              <option value="student">Murid</option>
              <option value="teacher">Guru</option>
              <option value="parent">Wali Murid</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role?.message && (
              <p className="text-xs text-red-400">
                {errors.role.message.toString()}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-400">User di database</label>

            <Controller
              name="userId"
              control={control}
              defaultValue={foundUser?.id || ""}
              render={({ field }) => {
                return (
                  <Select
                    {...field}
                    options={usersOptions}
                    className="text-sm"
                    classNamePrefix="select"
                    placeholder="Cari User..."
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value)
                    }
                    value={
                      usersOptions.find(
                        (opt: { value: string; label: string }) =>
                          opt.value === field.value
                      ) || null
                    }
                  />
                );
              }}
            />

            {errors.userId?.message && (
              <p className="text-xs text-red-400">
                {errors.userId.message.toString()}
              </p>
            )}
          </div>
        </div>
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        {(state.error || Object.keys(errors).length > 0) && (
          <span className="text-red-500">
            Terjadi Kesalahan! {state.message ?? ""}
            <pre>
              {Object.entries(errors)
                .map(([key, val]) => `${key}: ${val?.message}`)
                .join("\n")}
            </pre>
          </span>
        )}

        <div className="text-center pt-4 justify-items-center">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full mr-2"></span>
            )}
            {isSubmitting
              ? "Memproses..."
              : type === "create"
              ? "Tambah kelas"
              : "Update dan Simpan"}
          </button>
        </div>
      </form>
    </>
  );
};

export default UserForm;
