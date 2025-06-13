"use client";

import { useState } from "react";

export default function HardwareScannerPage() {
  const [barcode, setBarcode] = useState("");

  const handleInput = () => {
    // Misalnya input dari scanner USB seperti keyboard
    alert(`Barcode terbaca: ${barcode}`);
    // Lanjut ke detail pesanan
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4">
          Scan Barcode (USB Scanner)
        </h1>
        <input
          type="text"
          autoFocus
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleInput()}
          placeholder="Tempelkan barcode ke scanner"
          className="w-full border border-gray-300 rounded-md px-4 py-2"
        />
        <p className="text-sm text-gray-500 mt-2 text-center">
          Tekan Enter setelah pemindaian selesai
        </p>
      </div>
    </div>
  );
}
