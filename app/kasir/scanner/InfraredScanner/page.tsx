"use client";

import { useEffect, useState } from "react";

export default function InfraredScannerPage() {
  const [input, setInput] = useState("");

  const handleScan = () => {
    // Lakukan parsing input scanner IR
    alert(`Kode pesanan: ${input}`);
    // Redirect ke halaman detail pesanan jika perlu
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4">
          Scan Barcode (Infrared)
        </h1>
        <input
          type="text"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
          placeholder="Arahkan scanner IR ke barcode"
          className="w-full border border-gray-300 rounded-md px-4 py-2"
        />
        <p className="text-sm text-gray-500 mt-2 text-center">
          Tekan Enter setelah input masuk otomatis
        </p>
      </div>
    </div>
  );
}
