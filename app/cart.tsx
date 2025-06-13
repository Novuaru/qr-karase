"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem("cart");
      }
    }
    const storedRestaurantId = localStorage.getItem("restaurant_id");
    setRestaurantId(storedRestaurantId);
    setLoading(false);
  }, []);

  const totalPrice = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmitOrder = async () => {
    if (!restaurantId) {
      alert("Restaurant ID tidak ditemukan");
      return;
    }
    if (Object.keys(cart).length === 0) {
      alert("Keranjang kosong");
      return;
    }

    setSubmitting(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          restaurant_id: restaurantId,
          status: "pending",
          // created_at otomatis dibuat oleh Supabase jika timestamp default sudah diset
        })
        .select()
        .single();

      if (orderError || !order) {
        throw new Error(orderError?.message || "Gagal membuat pesanan");
      }

      const orderItems = Object.values(cart).map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        name_snapshot: item.name,
        price_snapshot: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      // Hapus cart setelah sukses submit
      localStorage.removeItem("cart");
      localStorage.removeItem("restaurant_id");
      setCart({});

      // Redirect ke halaman QR (sesuaikan path)
      router.push(`/qr/${order.id}`);
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat submit pesanan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Memuat...</p>;
  }

  if (Object.keys(cart).length === 0) {
    return <p className="text-center mt-10 text-gray-500">Keranjang kosong</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Keranjang</h1>
      <ul className="space-y-2 mb-4">
        {Object.values(cart).map((item) => (
          <li key={item.id} className="border p-2 rounded">
            <div className="flex justify-between">
              <span>{item.name}</span>
              <span>
                {item.quantity} x Rp{item.price.toLocaleString("id-ID")}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>Rp{totalPrice.toLocaleString("id-ID")}</span>
      </div>
      <button
        onClick={handleSubmitOrder}
        disabled={submitting}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {submitting ? "Memproses..." : "Pesan Sekarang"}
      </button>
    </div>
  );
}
