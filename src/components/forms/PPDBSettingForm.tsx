"use client";

import { useForm, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  startTransition,
  useActionState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ConfirmDialog from "../ConfirmDialog";

import {
  ppdbSettingSchema,
  PPDBSettingSchema,
} from "@/lib/formValidationSchema";

import { CurrentState, updatePPDBSetting } from "@/lib/actions";
import InputField from "../InputField";

type Props = {
  setOpen?: Dispatch<SetStateAction<boolean>>;
  type: "update";
  data?: any; // your initial PPDB settings
};

const PPDBSettingForm = ({ setOpen, type, data }: Props) => {
  const router = useRouter();

  const {
    register,
    reset,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<PPDBSettingSchema>({
    resolver: zodResolver(ppdbSettingSchema),
    defaultValues: {
      startDate: data?.startDate
        ? new Date(data.startDate).toISOString().split("T")[0]
        : "",
      endDate: data?.endDate
        ? new Date(data.endDate).toISOString().split("T")[0]
        : "",
      quota: (data?.quota as number) || 0,
    },
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PPDBSettingSchema | null>(null);

  // Server action wrapper
  const updateHandler = async (
    prevState: CurrentState,
    payload: PPDBSettingSchema
  ) => {
    return await updatePPDBSetting(prevState, payload);
  };

  const [state, formAction] = useActionState(updateHandler, {
    success: false,
    error: false,
    message: "",
  });

  // First submit -> validate -> open confirm modal
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valid = await trigger();
    if (valid) {
      handleSubmit((data) => {
        setFormData(data);
        setShowConfirm(true);
      })();
    }
  };

  // Confirm -> send to server
  const handleConfirmSubmit = () => {
    if (formData) {
      setIsSubmitting(true);

      startTransition(() => {
        formAction(formData);
      });
    }
    setShowConfirm(false);
  };

  // After success
  useEffect(() => {
    if (state.success) {
      toast("Pengaturan PPDB berhasil disimpan!");
      setIsSubmitting(false);
      setOpen?.(false);
      router.refresh();
    }
  }, [state, setOpen, router]);

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold">Pengaturan PPDB</h1>
        <div className="flex justify-between flex-wrap gap-4">
          {/* Start Date */}
          <InputField
            label="Waktu mulai"
            name="startDate"
            register={register}
            error={errors?.startDate}
            type="date"
          />

          <InputField
            label="Waktu selesai"
            name="endDate"
            register={register}
            error={errors?.endDate}
            type="date"
          />

          {/* Quota */}
          <InputField
            label="Kuota"
            name="quota"
            register={register}
            error={errors?.quota}
            type="number"
          />
        </div>

        <div className="text-center pt-4 justify-items-center">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full mr-2"></span>
            )}
            {isSubmitting ? "Menyimpan ..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>

      {showConfirm && (
        <ConfirmDialog
          message={"Simpan perubahan pengaturan PPDB?"}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default PPDBSettingForm;
