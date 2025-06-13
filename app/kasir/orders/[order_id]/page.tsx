'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function OrderReceiptPage() {
  const { order_id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [kasirName, setKasirName] = useState<string | null>(null);
  const [kasirId, setKasirId] = useState<string | null>(null);
  const [shiftId, setShiftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const hasPrintedRef = useRef(false);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    const now = new Date();
    setTimestamp(
      now.toLocaleString('id-ID', {
        dateStyle: 'short',
        timeStyle: 'medium',
      })
    );

    setKasirId(localStorage.getItem('id_kasir'));
    setShiftId(localStorage.getItem('shift_id'));
    setKasirName(localStorage.getItem('kasir_nama') || 'Kasir');
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!order_id || !kasirId || !shiftId) return;

      setLoading(true);

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          table_number,
          status,
          restaurant_id,
          order_items (
            id,
            quantity,
            menu_items (
              name,
              price
            )
          )
        `)
        .eq('id', order_id)
        .single();

      if (orderError || !orderData) {
        alert('Gagal mengambil data pesanan.');
        router.push('/kasir/dashboard');
        return;
      }

      const { data: resto, error: restoError } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', orderData.restaurant_id)
        .single();

      if (restoError) {
        alert('Gagal mengambil nama restoran.');
        router.push('/kasir/dashboard');
        return;
      }

      setTableNumber(orderData.table_number);
      setOrderItems(orderData.order_items);
      setRestaurantName(resto?.name || 'Restoran');
      setLoading(false);
    };

    fetchOrder();
  }, [order_id, kasirId, shiftId]);

  const handlePrint = async () => {
    if (hasPrintedRef.current || !order_id || !kasirId || !shiftId) return;

    hasPrintedRef.current = true;
    setPrinting(true);

    for (const item of orderItems) {
      const { quantity, menu_items } = item;
      const price = menu_items?.price || 0;

      await supabase.from('sales_logs').insert({
        id: uuidv4(),
        kasir_id: kasirId,
        shift_id: shiftId,
        order_id: order_id,
        menu_name: menu_items?.name || 'Item',
        quantity,
        total_price: quantity * price,
      });
    }

    await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', order_id);

    window.print();
    router.push('/kasir/dashboard');
  };

  const total = orderItems.reduce((sum, item) => {
    return sum + item.quantity * (item.menu_items?.price || 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Memuat data pesanan...
      </div>
    );
  }

  return (
    <main className="max-w-sm mx-auto p-4 print:w-[58mm] print:max-w-none print:p-0 print:font-mono">
      {/* Header Struk */}
      <div className="text-center mb-2 print:text-sm">
        <h2 className="font-bold text-lg print:text-base">{restaurantName}</h2>
        <p className="text-xs">Meja: {tableNumber}</p>
        <p className="text-xs">Waktu: {timestamp}</p>
        <p className="text-xs">Kasir: {kasirName}</p>
      </div>

      <div className="border-t border-dashed my-2" />

      {/* Daftar Item */}
      <div className="text-sm print:text-xs">
        {orderItems.map((item, idx) => (
          <div key={idx} className="flex justify-between mb-1">
            <span>{item.quantity} x {item.menu_items?.name}</span>
            <span>
              Rp {(item.quantity * item.menu_items?.price).toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed my-2" />

      {/* Total */}
      <div className="flex justify-between font-bold text-base print:text-sm">
        <span>Total</span>
        <span>Rp {total.toLocaleString('id-ID')}</span>
      </div>

      <div className="border-t border-dashed my-2" />

      {/* Ucapan Terima Kasih */}
      <div className="text-center text-xs mt-4">
        <p>Terima kasih 🙏</p>
        <p>Struk ini adalah bukti transaksi sah</p>
      </div>

      {/* Tombol (disembunyikan saat cetak) */}
      <div className="mt-6 print:hidden">
        <button
          onClick={handlePrint}
          disabled={printing}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {printing ? 'Mencetak...' : 'Cetak Struk'}
        </button>
        <button
          onClick={() => router.push('/kasir/dashboard')}
          className="w-full mt-2 text-sm text-center text-blue-600 hover:underline"
        >
          ← Kembali ke Dashboard
        </button>
      </div>
    </main>
  );
}
