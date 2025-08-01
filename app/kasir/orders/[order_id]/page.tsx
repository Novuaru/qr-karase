'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function OrderDetailPage() {
  const { order_id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [kasirName, setKasirName] = useState<string | null>(null);
  const [kasirId, setKasirId] = useState<string | null>(null);
  const [shiftId, setShiftId] = useState<string | null>(null);
  const [shiftData, setShiftData] = useState<{
    id: string;
    kasir_id: string;
    start_time: string;
    end_time: string | null;
  } | null>(null);
  const [order, setOrder] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const hasPrintedRef = useRef(false);

  useEffect(() => {
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
        alert('Gagal mengambil detail pesanan.');
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

      const { data: shift, error: shiftError } = await supabase
        .from('shifts')
        .select('*')
        .eq('id', shiftId)
        .eq('kasir_id', kasirId)
        .single();

      if (shiftError) {
        console.warn('Gagal mengambil shift:', shiftError.message);
      }

      setOrderItems(orderData.order_items ?? []);
      setTableNumber(orderData.table_number);
      setRestaurantName(resto?.name || null);
      setShiftData(shift || null);
      setOrder(orderData);
      setLoading(false);
    };

    fetchOrder();
  }, [order_id, kasirId, shiftId]);

  const total = Math.round(
    orderItems.reduce(
      (acc, item) => acc + item.quantity * item.menu_items.price,
      0
    )
  );

  const formatShiftTime = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };

    const startStr = startDate.toLocaleString('id-ID', options);
    const endStr = endDate ? endDate.toLocaleString('id-ID', options) : 'Masih berjalan';

    return `${startStr} - ${endStr}`;
  };

  const handlePrintClick = async () => {
    if (printing || hasPrintedRef.current) return;

    if (!order_id || !kasirId || !shiftId) {
      alert('Data tidak lengkap');
      return;
    }

    setPrinting(true);
    const salesLogId = uuidv4();

    const { error } = await supabase.from('sales_logs').insert([
      {
        id: salesLogId,
        order_id,
        kasir_id: kasirId,
        shift_id: shiftId,
        total_price: total,
      },
    ]);

    if (error) {
      alert('Gagal menyimpan data penjualan: ' + error.message);
      setPrinting(false);
      return;
    }

    await supabase.from('orders').update({ 
      status: 'completed', 
      printed_at: new Date(),
      is_confirmed: true // <-- tambahkan ini
    }).eq('id', order_id);
    hasPrintedRef.current = true;

    const handleAfterPrint = () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      router.push('/kasir/dashboard');
    };

    window.addEventListener('afterprint', handleAfterPrint);  

    setTimeout(() => {
      window.print();
    }, 500);

    setPrinting(false);
  };

  // Contoh fungsi konfirmasi admin
  const handleConfirmPayment = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ is_paid: true })
      .eq('id', orderId);

    if (error) {
      alert('Gagal konfirmasi pembayaran');
    } else {
      alert('Pembayaran dikonfirmasi!');
      // Refresh data atau redirect jika perlu
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        <span className="ml-2">Memuat detail pesanan...</span>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-md mx-auto bg-white print:bg-white text-sm font-mono">
      <div className="mb-2 text-xs text-gray-500 print:hidden">
        ID Kasir: <span className="text-gray-800">{kasirId}</span>
      </div>

      {shiftData && (
        <div className="mb-2 text-xs text-gray-600 print:hidden">
          Shift: <span className="font-semibold">{formatShiftTime(shiftData.start_time, shiftData.end_time)}</span>
        </div>
      )}

      <h1 className="text-center text-base font-bold mb-1">PT KARASE</h1>
      <h2 className="text-center font-semibold mb-2">{restaurantName}</h2>

      <p className="text-center text-xs mb-2">
        Meja: <span className="font-semibold">{tableNumber}</span>
      </p>

      <hr className="border-dashed border-gray-400 mb-2" />

      <table className="w-full text-xs mb-2">
        <thead>
          <tr>
            <th className="text-left">Menu</th>
            <th className="text-center">Qty</th>
            <th className="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item) => (
            <tr key={item.id}>
              <td>{item.menu_items.name}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">
                Rp {(item.menu_items.price * item.quantity).toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-dashed border-gray-400 my-2" />
      <p className="text-right font-bold">
        TOTAL: Rp {total.toLocaleString('id-ID')}
      </p>

      <div className="mt-4 text-xs text-left print:block hidden">
        Kasir: <span className="font-semibold">{kasirName}</span>
      </div>

      <p className="mt-4 text-center text-xs text-gray-600 print:hidden">
        Tekan tombol cetak struk untuk mencetak dan menyimpan data penjualan
      </p>

      <div className="mt-4 text-center print:hidden">
        <button
          onClick={handlePrintClick}
          disabled={printing || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {printing ? (
            <>
              <Loader2 className="inline w-4 h-4 animate-spin mr-2" />
              Mencetak...
            </>
          ) : (
            'Cetak Struk'
          )}
        </button>
      </div>

      <div className="mt-4 text-center text-xs text-gray-800">
        Terima kasih telah memesan
        <br />
        Simpan struk ini sebagai bukti pembayaran
      </div>

      {order.is_confirmed && !order.is_paid && (
        <div className="mt-4 text-center">
          <button
            onClick={() => handleConfirmPayment(order.id)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Konfirmasi Pembayaran
          </button>
        </div>
      )}
    </main>
  );
}
