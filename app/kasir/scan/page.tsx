"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ScanPage() {
  const router = useRouter();
  const [kasir, setKasir] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKasirData = async () => {
      const storedKasir = localStorage.getItem("kasir");
      if (!storedKasir) {
        router.push("/kasir/login");
        return;
      }

      const parsed = JSON.parse(storedKasir);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", parsed.id)
        .eq("role", "kasir")
        .single();

      if (error || !data) {
        console.error("Kasir tidak ditemukan:", error);
        router.push("/kasir/login");
      } else {
        setKasir(data);
      }

      setLoading(false);
    };

    fetchKasirData();
  }, []);

  const handleScanMethod = (method: string) => {
    switch (method) {
      case "camera":
        router.push("/kasir/scanner/CameraScanner");
        break;
      case "infrared":
        router.push("/kasir/scanner/InfraredScanner");
        break;
      case "hardware":
        router.push("/kasir/scanner/HardwareScanner");
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-gray-100 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 animate-spin text-red-500 mb-4" />
        <p className="text-gray-700 text-xl font-semibold">Memuat Data Kasir</p>
        <p className="text-gray-500 text-sm mt-1">Mohon tunggu sebentar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-2xl border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4">
          Pilih Metode Pemindaian QR
        </h1>

        <div className="text-center text-gray-700 mb-6">
          {kasir ? (
            <>
              {/* <div>Selamat datang, <strong>{kasir.name || kasir.email}</strong></div> */}
              {/* <div className="mt-1 text-sm text-gray-500">
                ID Kasir: <span className="font-mono">{kasir.id}</span>
              </div> */}
            </>
          ) : (
            "Data kasir tidak ditemukan."
          )}
        </div>

        {/* <div className="grid gap-4">
          <button
            onClick={() => handleScanMethod("infrared")}
            className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            🔌 Scan via Infrared Scanner
          </button> */}

          <button
            onClick={() => handleScanMethod("camera")}
            className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            📷 Scan via Kamera
          </button>

          {/* <button
            onClick={() => handleScanMethod("hardware")}
            className="w-full py-3 px-4 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            💻 Scan via Scanner USB
          </button>
        </div> */}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/kasir/dashboard")}
            className="text-sm text-gray-500 hover:text-red-500 transition"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
