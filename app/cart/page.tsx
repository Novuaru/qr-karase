"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import toast, { Toaster } from "react-hot-toast";
import { ShoppingCartIcon, TrashIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/solid";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
};

export default function CartPage() {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const restaurant_id = searchParams.get("restaurant_id") || "";
  const router = useRouter();
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);

  const saveCartToLocalStorage = useCallback(
    (cartData: Record<string, CartItem>) => {
      if (typeof window === "undefined") return;

      if (Object.keys(cartData).length === 0) {
        localStorage.removeItem("cart");
        localStorage.removeItem("restaurant_id");
      } else {
        localStorage.setItem("cart", JSON.stringify(cartData));
        localStorage.setItem("restaurant_id", restaurant_id);
      }
    },
    [restaurant_id]
  );

  useEffect(() => {
    if (!restaurant_id) {
      router.replace("/");
      return;
    }

    setLoading(true);

    // Ambil cart dari localStorage
    const storedCart = localStorage.getItem("cart");
    const storedRestaurantId = localStorage.getItem("restaurant_id");

    if (storedCart && storedRestaurantId === restaurant_id) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        setCart({});
        localStorage.removeItem("cart");
        localStorage.removeItem("restaurant_id");
      }
    } else {
      setCart({});
      localStorage.removeItem("cart");
      localStorage.removeItem("restaurant_id");
    }

    // Ambil nomor meja dari localStorage (misal key: "table_number")
    const storedTableNumber = localStorage.getItem("table_number");
    if (storedTableNumber) {
      setTableNumber(storedTableNumber);
    }

    setLoading(false);
  }, [restaurant_id, router]);

  const removeItem = useCallback(
    (id: string) => {
      const item = cart[id];
      if (!item) return;

      toast(
        (t) => (
          <div className="flex flex-col items-center p-1">
            <p className="mb-3 text-sm font-medium text-gray-800">
              Yakin ingin menghapus <strong>{item.name}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                className="px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-semibold shadow-md transition-all duration-150 ease-in-out"
                onClick={() => {
                  setCart((prev) => {
                    const newCart = { ...prev };
                    delete newCart[id];
                    saveCartToLocalStorage(newCart);
                    return newCart;
                  });
                  toast.success(`${item.name} dihapus dari keranjang.`, {
                    icon: null,
                    style: {
                      borderRadius: '8px',
                      background: '#333',
                      color: '#fff',
                      padding: '12px 16px',
                    },
                  });
                  toast.dismiss(t.id);
                }}
              >
                Iya
              </button>
              <button
                className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-xs font-semibold shadow-md transition-all duration-150 ease-in-out"
                onClick={() => toast.dismiss(t.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: 'top-center',
          icon: null,
          style: {
            borderRadius: '8px',
            background: '#333', // Atau warna lain yang sesuai untuk konfirmasi
            color: '#fff',      // Atau warna lain yang sesuai
          },
        }
      );
    },
    [cart, saveCartToLocalStorage]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity < 1) return;
      setCart((prev) => {
        const item = prev[id];
        if (!item) return prev;
        const newCart = {
          ...prev,
          [id]: { ...item, quantity },
        };
        saveCartToLocalStorage(newCart);
        return newCart;
      });
    },
    [saveCartToLocalStorage]
  );

  const totalPrice = Object.values(cart).reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (submitting) return;
    if (!restaurant_id || Object.keys(cart).length === 0) return;

    setSubmitting(true);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id,
        status: "pending",
        created_at: new Date().toISOString(),
        table_number: tableNumber,
      })
      .select()
      .single();

    if (orderError || !order) {
      toast.error("Gagal membuat pesanan, coba lagi.", {
        icon: null,
        style: {
          borderRadius: '8px',
          background: '#D32F2F', // Warna merah untuk error
          color: '#fff',
          padding: '12px 16px',
        },
      });
      // @ts-ignore
      console.error("Order creation error:", orderError);
      setSubmitting(false);
      return;
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
      toast.error("Gagal menyimpan item pesanan.", {
        icon: null,
        style: {
          borderRadius: '8px',
          background: '#D32F2F', // Warna merah untuk error
          color: '#fff',
          padding: '12px 16px',
        },
      });
      // @ts-ignore
      console.error("Order items insertion error:", itemsError);
      setSubmitting(false);
      return;
    }

    localStorage.removeItem("cart");
    localStorage.removeItem("restaurant_id");
    localStorage.removeItem("table_number");
    setCart({});
    setTableNumber(null);

    toast.success("Pesanan berhasil dibuat!", {
      icon: null,
      style: {
        borderRadius: '8px',
        background: '#4CAF50', // Warna hijau untuk sukses
        color: '#fff',
        padding: '12px 16px',
      },
    });
    router.push(`/qr/${order.id}`);
  };

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
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
        <p className="mt-4 text-lg text-gray-600">Memuat keranjang...</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-4xl font-extrabold mb-4 text-center text-gray-900 flex items-center justify-center gap-3">
        <ShoppingCartIcon className="h-9 w-9 text-red-600" />
        Keranjang Belanja
      </h1>

      {tableNumber && (
        <p className="text-center mb-8 text-lg text-gray-700">
          Nomor Meja: <span className="font-semibold">{tableNumber}</span>
        </p>
      )}

      {Object.keys(cart).length === 0 ? (
        <p className="text-center text-gray-500 italic text-lg">Keranjang kosong.</p>
      ) : (
        <div className="space-y-6">
          {Object.values(cart).map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 border rounded-lg shadow-md hover:shadow-lg transition bg-white"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-28 h-28 object-cover rounded-lg shadow"
                  loading="lazy"
                />
              ) : (
                <div className="w-28 h-28 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-semibold select-none">
                  No Image
                </div>
              )}

              <div className="flex-1 flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{item.name}</h2>
                  <p className="mt-1 text-red-600 font-bold text-lg">
                    Rp{item.price.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex items-center mt-4 gap-3">
                  <button
                    aria-label={`Kurangi jumlah ${item.name}`}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex items-center justify-center w-9 h-9 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition"
                    disabled={item.quantity <= 1}
                  >
                    <MinusIcon className="w-5 h-5" />
                  </button>

                  <span className="text-xl font-semibold select-none">{item.quantity}</span>

                  <button
                    aria-label={`Tambah jumlah ${item.name}`}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex items-center justify-center w-9 h-9 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>

                  <button
                    aria-label={`Hapus ${item.name} dari keranjang`}
                    onClick={() => removeItem(item.id)}
                    className="ml-auto flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-600 hover:text-white transition"
                  >
                    <TrashIcon className="w-5 h-5" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="text-right text-3xl font-extrabold text-gray-900">
            Total: Rp{totalPrice.toLocaleString("id-ID")}
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="relative flex items-center justify-center gap-3 px-10 py-3 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {submitting && (
                <svg
                  className="w-6 h-6 animate-spin text-white"
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
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {submitting ? "Memproses..." : "Checkout"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
