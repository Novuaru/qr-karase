"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function QRPage() {
  const { order_id } = useParams();
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("name_snapshot, price_snapshot, quantity")
        .eq("order_id", order_id);

      if (error) {
        console.error("Gagal mengambil order:", error.message);
      } else {
        setOrderItems(data || []);
      }
    };

    if (order_id) fetchOrder();
  }, [order_id]);

  const total = orderItems.reduce(
    (acc, item) => acc + item.price_snapshot * item.quantity,
    0
  );

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">Struk Pemesanan</h1>
      {orderItems.map((item, i) => (
        <div key={i} className="flex justify-between mb-2">
          <div>
            <p className="font-semibold">{item.name_snapshot}</p>
            <p className="text-sm text-gray-500">x{item.quantity}</p>
          </div>
          <p>
            Rp{(item.quantity * item.price_snapshot).toLocaleString()}
          </p>
        </div>
      ))}
      <hr className="my-4" />
      <p className="text-right text-xl font-bold text-red-700">
        Total: Rp{total.toLocaleString()}
      </p>
    </main>
  );
}
