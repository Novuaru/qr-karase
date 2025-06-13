'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  getKasirFromStorage,
  getShiftIdFromStorage,
  clearKasirSession,
} from '@/lib/kasirSession';
import { Loader2 } from 'lucide-react';

export default function KasirDashboardPage() {
  const router = useRouter();
  const [kasir, setKasir] = useState<any>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    const storedKasir = getKasirFromStorage();
    if (!storedKasir) {
      router.push('/kasir/login');
    } else {
      setKasir(storedKasir);
    }
  }, [router]);

  async function handleLogout() {
    setLoadingLogout(true);

    const shiftId = getShiftIdFromStorage();
    if (shiftId) {
      const { error } = await supabase
        .from('shifts')
        .update({ end_time: new Date().toISOString() })
        .eq('id', shiftId);

      if (error) {
        console.error('Gagal update shift:', error.message);
        alert('Gagal logout. Coba lagi.');
        setLoadingLogout(false);
        return;
      }
    }

    clearKasirSession();
    router.push('/kasir/login');
  }

  if (!kasir) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-gray-100 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 animate-spin text-red-500 mb-4" />
        <p className="text-gray-700 text-xl font-semibold">Memuat Data Kasir</p>
        <p className="text-gray-500 text-sm mt-1">Mohon tunggu sebentar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-2xl border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-4">
          Dashboard Kasir
        </h1>

        <p className="text-center text-gray-700 mb-2 text-base">
          Nama Kasir aktif:
          <span className="font-semibold text-red-600 ml-2">{kasir.name}</span>
        </p>

        {/* <p className="text-center text-gray-700 mb-6 text-base">
          🆔 ID Kasir:
          <span className="font-semibold text-red-600 ml-2">{kasir.id}</span>
        </p>

        <p className="text-center text-gray-600 mb-6 text-sm">
          Login berhasil — data diambil dari localStorage.
        </p> */}

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => router.push('/kasir/scan')}
            className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition"
          >
            🔍 Scan QR
          </button>

          {/* <button
            onClick={() => router.push('/kasir/laporan')}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-800 text-white rounded-md font-semibold hover:bg-gray-900 transition"
          >
            📊 Laporan Penjualan
          </button> */}

          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-md font-semibold transition ${
              loadingLogout
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            🚪 {loadingLogout ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
}
