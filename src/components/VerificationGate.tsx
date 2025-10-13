"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FormModal from "./FormModal";
import Turnstile from "react-turnstile"; // yarn add react-turnstile

export const VerificationGate = () => {
  const [method, setMethod] = useState<"choose" | "email" | "captcha">(
    "choose"
  );
  const [step, setStep] = useState<"enterEmail" | "verifyOtp" | "done">(
    "enterEmail"
  );

  // --- State for email OTP ---
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const validateEmail = (email: string) =>
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  // --- Send OTP ---
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
      toast.success(
        isResend
          ? "OTP telah dikirim ulang ke email Anda."
          : "Kode OTP telah dikirim ke email Anda."
      );
      if (isResend) setResent(true);
    } catch (err) {
      toast.error("Gagal mengirim OTP. Periksa email Anda dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // --- Verify OTP ---
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

  // --- Final success ---
  if (step === "done") {
    return <FormModal type="create" table="ppdb" prefilEmail={email} />;
  }

  return (
    <div className="space-y-4">
      {/* Step 1: Choose verification method */}
      {method === "choose" && (
        <div className="space-y-3">
          <button
            onClick={() => {
              setMethod("email");
              setStep("enterEmail");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Verifikasi via Email (OTP)
          </button>
          <button
            onClick={() => {
              setMethod("captcha");
            }}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Verifikasi via Captcha
          </button>
        </div>
      )}

      {/* Method: Email OTP */}
      {method === "email" && (
        <>
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
                onClick={() => {
                  if (cooldown === 0) {
                    sendOtp(false);
                    setCooldown(60);
                  } else {
                    toast.info(
                      `Tunggu ${cooldown} detik sebelum mengirim ulang.`
                    );
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Tunggu (${cooldown}s)` : "Kirim OTP ke Email"}
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
                onClick={() => {
                  if (cooldown === 0) {
                    sendOtp(true);
                    setCooldown(60);
                  } else {
                    toast.info(
                      `Tunggu ${cooldown} detik sebelum mengirim ulang.`
                    );
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded ml-2"
                disabled={cooldown > 0}
              >
                {cooldown > 0
                  ? `Tunggu (${cooldown} detik)`
                  : "Kirim Ulang OTP"}
              </button>
              {resent && (
                <div className="text-sm text-yellow-700 mt-2">
                  OTP telah dikirim ulang ke email Anda.
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Method: Captcha */}
      {method === "captcha" && (
        <div className="flex flex-col items-center space-y-3">
          <Turnstile
            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onVerify={async (token) => {
              const res = await fetch("/api/verify-captcha", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
              });
              const data = await res.json();
              if (data.success) {
                setStep("done");
                toast.success("Verifikasi captcha berhasil.");
              } else {
                toast.error("Captcha tidak valid.");
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
