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
  creditsettingSchema,
  CreditSettingSchema,
} from "@/lib/formValidationSchema";

import { CurrentState, updateCreditsetting } from "@/lib/actions";

type Props = {
  setOpen?: Dispatch<SetStateAction<boolean>>;
  data?: any; // your initial PPDB settings
};

const CreditSettingForm = ({ setOpen, data }: Props) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { isDirty },
  } = useForm<CreditSettingSchema>({
    resolver: zodResolver(creditsettingSchema),
    defaultValues: {
      show: data?.show ?? false,
    },
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreditSettingSchema | null>(null);

  // Server action wrapper
  const updateHandler = async (
    prevState: CurrentState,
    payload: CreditSettingSchema
  ) => {
    return await updateCreditsetting(prevState, payload);
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
      toast("Pengaturan Credit berhasil disimpan!");
      setIsSubmitting(false);
      setOpen?.(false);
      router.refresh();
    }
  }, [state, setOpen, router]);

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold">Pengaturan Credit</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("show")}
              id="show-credit"
              className="h-4 w-4"
            />
            <label htmlFor="show-credit" className="text-sm">
              Tampilkan credit di homepage
            </label>
          </div>

          {/* Show button ONLY when changed */}
          {isDirty && (
            <button
              type="submit"
              className="h-9 px-4 text-sm bg-blue-600 text-white font-semibold
                 rounded hover:bg-blue-700 transition
                 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-blue-400 rounded-full"></span>
              )}
              Simpan
            </button>
          )}
        </div>
      </form>

      {showConfirm && (
        <ConfirmDialog
          message={"Simpan perubahan?"}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default CreditSettingForm;
