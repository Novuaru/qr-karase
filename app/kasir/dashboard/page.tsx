'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  getKasirFromStorage,
  getShiftIdFromStorage,
  clearKasirSession,
} from '@/lib/kasirSession';

interface Shift {
  id: string;
  start_time: string;
  end_time: string | null;
}

interface SalesLog {
  id: string;
  order_id: string;
  total: number;
  payment_method: string;
  created_at: string;
  cashier?: {
    name: string;
  };
}

export default function KasirDashboardPage() {
  const router = useRouter();
  const [kasir, setKasir] = useState<any>(null);
  const [shift, setShift] = useState<Shift | null>(null);
  const [salesToday, setSalesToday] = useState<SalesLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    const storedKasir = getKasirFromStorage();
    if (!storedKasir) {
      router.push('/kasir/login');
    } else {
      setKasir(storedKasir);
      fetchShift();
      fetchSalesToday(); // Tidak perlu lagi kirim kasirId
    }
  }, [router]);

  async function fetchShift() {
    const shiftId = getShiftIdFromStorage();
    if (!shiftId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('shifts')
      .select('id, start_time, end_time')
      .eq('id', shiftId)
      .single();

    if (!error && data) {
      setShift(data);
    }

    setLoading(false);
  }

  async function fetchSalesToday() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { data, error } = await supabase
      .from('sales_logs')
      .select(`
        id,
        order_id,
        total,
        payment_method,
        created_at,
        cashier:users ( name )
      `)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Supabase returns cashier as an array, but SalesLog expects an object
      const mappedData: SalesLog[] = data.map((log: any) => ({
        ...log,
        cashier: log.cashier && Array.isArray(log.cashier) && log.cashier.length > 0
          ? { name: log.cashier[0].name }
          : undefined,
      }));
      setSalesToday(mappedData);
    }
  }

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

  if (!kasir || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-lg">Memuat data kasir...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KIRI - Info Kasir & Aksi */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-center text-red-600 mb-4">
              Dashboard Kasir
            </h1>

            <div className="text-center text-gray-700 mb-6 space-y-2">
              <p>
                📛 <span className="font-semibold">Kasir:</span>{' '}
                <span className="text-red-600 font-bold">{kasir.name}</span>
              </p>
              {shift && (
                <p className="text-sm text-green-600">
                  ⏱️ Shift dimulai: {new Date(shift.start_time).toLocaleTimeString('id-ID')}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/kasir/scan')}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
              >
                🔍 Scan QR Pesanan
              </button>

              <button
                onClick={() => router.push('/kasir/laporan/harian')}
                className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition"
              >
                📊 Laporan Hari Ini
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className={`mt-6 w-full py-3 rounded-xl font-semibold transition ${
              loadingLogout
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            🚪 {loadingLogout ? 'Sedang logout...' : 'Logout'}
          </button>
        </div>

        {/* KANAN - Tabel Penjualan */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Penjualan Hari Ini
          </h2>

          {salesToday.length === 0 ? (
            <p className="text-gray-500 text-center">Belum ada transaksi hari ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 border">Waktu</th>
                    <th className="px-4 py-2 border">Pesanan</th>
                    <th className="px-4 py-2 border">Total</th>
                    <th className="px-4 py-2 border">Metode</th>
                    <th className="px-4 py-2 border">Kasir</th>
                  </tr>
                </thead>
                <tbody>
                  {salesToday.map((log) => (
                    <tr key={log.id} className="text-center hover:bg-gray-50">
                      <td className="px-4 py-2 border text-gray-700">
                        {new Date(log.created_at).toLocaleTimeString('id-ID')}
                      </td>
                      <td className="px-4 py-2 border font-medium">
                        {log.order_id}
                      </td>
                      <td className="px-4 py-2 border text-green-600 font-semibold">
                        Rp {log.total.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-2 border text-gray-600">
                        {log.payment_method}
                      </td>
                      <td className="px-4 py-2 border text-red-600 font-semibold">
                        {log.cashier?.name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
