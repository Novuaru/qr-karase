"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export default function OrderReceiptPage() {
  const { order_id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [shiftId, setShiftId] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [kasirName, setKasirName] = useState<string>("");

  const kasir_id = typeof window !== "undefined" ? localStorage.getItem("id_kasir") : null;

  useEffect(() => {
    if (!order_id || !kasir_id) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: orderData } = await supabase
        .from("orders")
        .select("*, order_items(*, menu_items(name, price)), restaurants(name, location)")
        .eq("id", order_id)
        .single();

      if (!orderData) {
        setLoading(false);
        return;
      }

      setOrder(orderData);
      setOrderItems(orderData.order_items || []);

      const total = orderData.order_items.reduce((sum: number, item: any) => {
        return sum + item.menu_items.price * item.quantity;
      }, 0);
      setTotalPrice(total);

      const { data: shiftData } = await supabase
        .from("shifts")
        .select("*")
        .eq("kasir_id", kasir_id)
        .is("end_time", null)
        .order("start_time", { ascending: false })
        .limit(1)
        .single();

      if (shiftData) setShiftId(shiftData.id);

      const { data: kasirData } = await supabase
        .from("users")
        .select("name")
        .eq("id", kasir_id)
        .single();

      if (kasirData) setKasirName(kasirData.name);

      setLoading(false);
    };

    fetchData();
  }, [order_id, kasir_id]);

  const handleConfirm = async () => {
    if (!order_id || !kasir_id || !shiftId || totalPrice <= 0) return;

    setSaving(true);

    const { error: insertError } = await supabase.from("sales_logs").insert([{
      order_id,
      kasir_id,
      shift_id: shiftId,
      total_price: totalPrice,
    }]);

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", order_id);

    if (insertError || updateError) {
      console.error("Gagal menyimpan atau mencetak:", insertError || updateError);
      setSaving(false);
      return;
    }

    setCompleted(true);
    setSaving(false);
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center text-red-500 mt-20">Pesanan tidak ditemukan.</div>;
  }

  return (
    <div className="max-w-sm mx-auto p-4 print:p-0 font-mono text-xs text-black">
      {/* === STRUK === */}
      <div
        id="receipt"
        className="bg-white p-4 shadow rounded border print:border-none print:shadow-none print:p-1 print:rounded-none print:w-[72mm]"
      >
        <div className="text-center mb-2">
          <h2 className="text-base font-bold uppercase tracking-wide text-red-700">
            {order.restaurants?.name || "Nama Restoran"}
          </h2>
          <p className="text-[10px]">{order.restaurants?.location || "-"}</p>
          <div className="my-1 border-t border-dashed border-gray-400" />
        </div>

        <div className="mb-2">
          <p>ID: <span className="float-right">{order.id}</span></p>
          <p>Kasir: <span className="float-right">{kasirName}</span></p>
          <p>Tanggal: <span className="float-right">{new Date(order.created_at).toLocaleString()}</span></p>
        </div>

        <div className="my-1 border-t border-dashed border-gray-400" />

        <div className="mb-2">
          {orderItems.map((item, i) => (
            <div key={i} className="flex justify-between">
              <div className="w-1/2 truncate">{item.menu_items.name}</div>
              <div className="text-center w-1/6">x{item.quantity}</div>
              <div className="text-right w-1/3">Rp {(item.menu_items.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className="my-1 border-t border-dashed border-gray-400" />

        <div className="flex justify-between font-bold text-red-700 mt-2">
          <span>Total</span>
          <span>Rp {totalPrice.toLocaleString()}</span>
        </div>

        <div className="my-1 border-t border-dashed border-gray-400" />

        <div className="text-center mt-2">
          <p>Terima kasih!</p>
          <p>~ Sampai Jumpa Kembali ~</p>
        </div>
      </div>

      {/* === TOMBOL AKSI === */}
      <div className="flex gap-2 mt-4 print:hidden justify-between">
        <button
          onClick={() => router.push("/kasir/dashboard")}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          ← Kembali
        </button>
        <button
          onClick={handleConfirm}
          disabled={saving || completed}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-60"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" />
              Menyimpan...
            </span>
          ) : (
            "Simpan & Cetak"
          )}
        </button>
      </div>

      {/* === NOTIFIKASI STATUS === */}
      {completed && (
        <div className="mt-3 text-green-700 text-center print:hidden">
          ✅ Pesanan berhasil disimpan dan dicetak.
        </div>
      )}
    </div>
  );
}
