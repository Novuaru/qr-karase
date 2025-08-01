'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

type Order = {
  id: string;
  table_number: string;
  created_at: string;
};

export default function PesananPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, table_number, created_at')
      .eq('is_paid', true)
      .eq('is_confirmed', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data pesanan:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const handleConfirmOrder = async (order_id: string) => {
    setConfirmingId(order_id);
    const { error } = await supabase
      .from('orders')
      .update({ is_confirmed: true })
      .eq('id', order_id);

    if (error) {
      console.error('Gagal konfirmasi pesanan:', error);
    } else {
      setOrders((prev) => prev.filter((order) => order.id !== order_id));
    }
    setConfirmingId(null);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Pesanan Menunggu Konfirmasi
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <ArrowPathIcon className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center mt-12">
          Tidak ada pesanan yang menunggu konfirmasi.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow p-4 rounded-xl flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  Meja {order.table_number}
                </p>
                <p className="text-sm text-gray-500">Order ID: {order.id}</p>
              </div>

              <button
                onClick={() => handleConfirmOrder(order.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={confirmingId === order.id}
              >
                {confirmingId === order.id ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Mengkonfirmasi...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Konfirmasi
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

