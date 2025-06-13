"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import QRCode from "react-qr-code";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function QRPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  const id = params?.id;

  useEffect(() => {
    if (!id) return;

    // Ambil nomor meja dari localStorage
    if (typeof window !== "undefined") {
      const storedTableNumber = localStorage.getItem("table_number");
      setTableNumber(storedTableNumber);
    }

    const fetchOrderStatus = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("id", id)
        .single();

      if (error || !data) {
        setOrderStatus("not_found");
      } else {
        setOrderStatus(data.status);
      }

      // Jika status completed, langsung redirect
      if (data?.status === "completed") router.push("/");

      setLoading(false);
    };

    fetchOrderStatus();

    // Polling status pesanan setiap 3 detik
    const interval = setInterval(fetchOrderStatus, 3000);
    return () => clearInterval(interval);
  }, [id, supabase, router]);

  const handleDone = () => router.push("/");

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-6 bg-white">
        <svg
          className="w-16 h-16 animate-spin text-red-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-4 text-lg text-gray-600">Memuat QR Code...</p>
      </main>
    );
  }

  if (orderStatus === "not_found") {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 text-center">
        <AlertCircle size={48} className="text-red-600 mb-4 animate-pulse" />
        <h2 className="text-2xl font-semibold text-red-600 mb-2">
          Pesanan tidak ditemukan
        </h2>
        <p className="text-gray-600 mb-4">
          Silakan kembali dan buat pesanan baru.
        </p>
        <button
          onClick={handleDone}
          className="mt-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition"
        >
          Kembali
        </button>
      </main>
    );
  }

  const renderStatus = (status: string | null) => {
    switch (status) {
      case "pending":
        return <p className="mt-6 text-yellow-600 font-semibold">Status Pesanan: Menunggu konfirmasi</p>;
      case "scanned":
        return <p className="mt-6 text-purple-600 font-semibold">Status Pesanan: Telah dipindai oleh kasir</p>;
      case "processing":
        return <p className="mt-6 text-blue-600 font-semibold">Status Pesanan: Sedang diproses</p>;
      case "completed":
        return (
          <p className="mt-6 text-green-600 font-semibold">
            Status Pesanan: Selesai! Mengarahkan ke halaman utama...
          </p>
        );
      case "cancelled":
        return <p className="mt-6 text-gray-600 font-semibold">Status Pesanan: Dibatalkan</p>;
      default:
        return <p className="mt-6 text-red-600 font-semibold">Status Pesanan: Tidak diketahui</p>;
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-white print:bg-white">
      <CheckCircle size={48} className="text-green-600 mb-4 print:hidden" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2 print:hidden">QR Code Pesanan Anda</h2>
      <p className="text-gray-600 mb-2 text-center max-w-md print:hidden">
        Tunjukkan QR Code ini ke kasir untuk memproses pesanan Anda.
      </p>

      {/* Tampilkan nomor meja */}
      {/* <p className="mb-6 text-lg font-semibold text-gray-700">
        Nomor Meja:{" "}
        {tableNumber ? (
          <span className="text-red-600">{tableNumber}</span>
        ) : (
          <span className="text-gray-400 italic">Tidak tersedia</span>
        )}
      </p> */}

      <div className="bg-white p-4 rounded-xl shadow-md">
        <QRCode value={id as string} size={256} />
      </div>

      {renderStatus(orderStatus)}

      <button
        onClick={handleDone}
        className="mt-8 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition print:hidden"
      >
        Selesai
      </button>
    </main>
  );
}
