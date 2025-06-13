"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import Link from "next/link";

interface IDetectedBarcode {
  rawValue: string;
}

export default function ScanPage() {
  const router = useRouter();
  const [scannedData, setScannedData] = useState("");

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      setScannedData(result);
      router.push(`/kasir/orders/${result}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <Link 
            href="/kasir" 
            className="text-blue-600 hover:text-blue-800"
          >
            ← Kembali
          </Link>
          <h1 className="text-2xl font-bold">Pindai QR Pesanan</h1>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <Scanner
            onScan={handleScan}
            onError={(error) => console.error(error)}
          />
        </div>
        
        {scannedData && (
          <p className="mt-4 text-green-600 text-center">Data Terdeteksi: {scannedData}</p>
        )}
      </div>
    </div>
  );
}
