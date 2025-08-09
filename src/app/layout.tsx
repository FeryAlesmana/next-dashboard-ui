import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import ResponsiveToast from "@/components/ResponsiveToast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SMP Islamiyah",
  description: "Sistem Informasi Sekolah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children} <ResponsiveToast />
        </body>
      </html>
    </ClerkProvider>
  );
}
