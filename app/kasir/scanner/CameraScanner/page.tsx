"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, CameraDevice } from "html5-qrcode";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const SCAN_CONTAINER_ID = "qr-reader";

export default function KasirScanPage() {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);
  const [loadingCameras, setLoadingCameras] = useState(true);
  const [loadingScan, setLoadingScan] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const router = useRouter();

  const startScanner = async (cameraId: string) => {
    const container = document.getElementById(SCAN_CONTAINER_ID);
    if (!container) return;

    container.innerHTML = "";

    const html5QrCode = new Html5Qrcode(SCAN_CONTAINER_ID);
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
        },
        async (decodedText) => {
          if (hasScannedRef.current) return;

          const orderId = decodedText.trim();
          if (!orderId || orderId.length < 10) {
            alert("QR code tidak valid.");
            return;
          }

          hasScannedRef.current = true;
          setLoadingScan(true);

          const { error } = await supabase
            .from("orders")
            .update({ status: "scanned" })
            .eq("id", orderId);

          if (error) {
            console.error("Gagal update status:", error);
            alert("Gagal mengubah status pesanan.");
            setLoadingScan(false);
            hasScannedRef.current = false;
            return;
          }

          setScanSuccess(true);
          await html5QrCode.stop();
          await html5QrCode.clear();
          router.push(`/kasir/orders/${orderId}`);
        },
        (err) => {
          console.warn("Scan error:", err);
        }
      )
      .catch((err) => {
        console.error("Gagal memulai scanner:", err);
      });
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
    }
  };

  const handleCameraChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cameraId = e.target.value;
    if (!cameraId) return;

    setSelectedCameraId(cameraId);
    hasScannedRef.current = false;
    await stopScanner();
    await startScanner(cameraId);
  };

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
        } else {
          setCameras([]);
          alert("Tidak ada kamera yang ditemukan.");
        }
      })
      .catch((err) => {
        console.error("Gagal mendapatkan kamera:", err);
        alert("Kamera tidak tersedia atau tidak diizinkan aksesnya.");
      })
      .finally(() => {
        setLoadingCameras(false);
      });

    return () => {
      stopScanner();
      hasScannedRef.current = false;
    };
  }, []);

  if (loadingCameras) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-100 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 animate-spin text-red-500 mb-4" />
        <p className="text-gray-700 text-xl font-semibold">Mempersiapkan Kamera</p>
        <p className="text-gray-500 text-sm mt-1">Mohon tunggu sebentar...</p>
      </div>
    );
  }

  if (loadingScan && !scanSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-100 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 animate-spin text-red-500 mb-4" />
        <p className="text-gray-700 text-xl font-semibold">Memproses QR Code</p>
        <p className="text-gray-500 text-sm mt-1">Mohon tunggu sebentar...</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-xl font-bold mb-4 text-center text-red-800">
          Scan QR Pesanan
        </h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pilih Kamera
          </label>
          <select
            value={selectedCameraId ?? ""}
            onChange={handleCameraChange}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">Silakan pilih kamera...</option>
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Kamera ${camera.id}`}
              </option>
            ))}
          </select>
        </div>

        <div
          id={SCAN_CONTAINER_ID}
          className="mx-auto"
        />
      </div>
    </div>
  );
}
