// components/ResponsiveToast.tsx
"use client";

import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";

export default function ResponsiveToast() {
  const [toastPosition, setToastPosition] = useState<
    "bottom-right" | "top-left" | "top-right"
  >("bottom-right");

  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth <= 768) {
        setToastPosition("top-right");
      } else {
        setToastPosition("bottom-right");
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return <ToastContainer position={toastPosition} theme="dark" />;
}
