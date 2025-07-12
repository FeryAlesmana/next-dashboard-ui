import { useState } from "react";
import { toast } from "react-toastify";
import FormModal from "./FormModal";

export const EmailVerificationGate = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"enterEmail" | "verifyOtp" | "done">("enterEmail");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  };

  const sendOtp = async (isResend = false) => {
    if (!validateEmail(email)) {
      toast.error("Format email tidak valid. Mohon periksa kembali.");
      return;
    }
    setLoading(true);
    setResent(false);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      setStep("verifyOtp");
      toast.success(isResend ? "OTP telah dikirim ulang ke email Anda." : "Kode OTP telah dikirim ke email Anda.");
      if (isResend) setResent(true);
    } catch (err) {
      toast.error("Gagal mengirim OTP. Periksa email Anda dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("done");
        toast.success("Verifikasi email berhasil.");
      } else {
        toast.error("OTP salah atau tidak valid.");
      }
    } catch (err) {
      toast.error("Verifikasi gagal. Coba lagi.");
    }
  };

  if (step === "done") {
    return <FormModal type="create" table="ppdb" prefilEmail={email} />;
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
          <span>Mengirim email OTP...</span>
        </div>
      )}
      {step === "enterEmail" && !loading && (
        <>
          <input
            type="email"
            placeholder="Masukkan email"
            className="w-full p-2 border rounded text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={() => sendOtp(false)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Kirim OTP ke Email
          </button>
        </>
      )}
      {step === "verifyOtp" && !loading && (
        <>
          <input
            type="text"
            placeholder="Masukkan OTP"
            className="w-full p-2 border rounded text-black"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={verifyOtp}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Verifikasi OTP
          </button>
          <button
            onClick={() => sendOtp(true)}
            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded ml-2"
          >
            Kirim Ulang OTP
          </button>
          {resent && (
            <div className="text-sm text-yellow-700 mt-2">OTP telah dikirim ulang ke email Anda.</div>
          )}
        </>
      )}
    </div>
  );
};
