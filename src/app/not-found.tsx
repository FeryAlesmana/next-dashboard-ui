"use client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function NotFound() {
  const { isSignedIn } = useUser();
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-gray-50">
      {/* Background logo */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-10"
        style={{ backgroundImage: "url('/logo.png')" }}
      />

      {/* Foreground content */}
      <div className="z-10">
        <h1 className="text-4xl font-bold text-gray-800">
          404 - Halaman tidak ditemukan
        </h1>
        <p className="text-gray-600 mt-2">Mohon periksa URL Anda</p>
      </div>

      {/* Buttons */}
      <div className="z-10 mt-10 flex gap-4">
        <Link
          href="/"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Kembali ke Beranda
        </Link>
        {!isSignedIn ? (
          <Link
            href="/sign-in"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Login
          </Link>
        ) : (
          []
        )}
      </div>
    </div>
  );
}
