"use client";
import { useState } from "react";

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
        <p className="text-center font-medium mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-blue-600 hover:bg-gray-600 text-white px-4 py-2 rounded"
            onClick={onConfirm}
          >
            Ya
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            onClick={onCancel}
          >
            Tidak
          </button>
        </div>
      </div>
    </div>
  );
}
