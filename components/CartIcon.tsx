'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function CartIcon() {
  const [totalItems, setTotalItems] = useState(0);
  const [cartLink, setCartLink] = useState('/cart');
  const [canNavigate, setCanNavigate] = useState(true);

  useEffect(() => {
    const updateCart = () => {
      try {
        const cartStr = localStorage.getItem('cart');
        const restaurantId = localStorage.getItem('restaurant_id');
        const tableNumber = localStorage.getItem('table_number');

        // Hitung jumlah item
        if (cartStr) {
          const cart = JSON.parse(cartStr);
          const count = Object.values(cart).reduce(
            (sum: number, item: any) => sum + (item.quantity || 0),
            0
          );
          setTotalItems(count);
        } else {
          setTotalItems(0);
        }

        // Validasi
        if (!restaurantId || !tableNumber) {
          setCanNavigate(false);
        } else {
          setCanNavigate(true);
          setCartLink(`/cart?restaurant_id=${restaurantId}&table_number=${tableNumber}`);
        }
      } catch {
        setTotalItems(0);
        setCanNavigate(false);
        setCartLink('/cart');
      }
    };

    updateCart();
    window.addEventListener('storage', updateCart);
    const interval = setInterval(updateCart, 1000);

    return () => {
      window.removeEventListener('storage', updateCart);
      clearInterval(interval);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (totalItems === 0) {
      e.preventDefault();
      toast.error('Keranjang masih kosong. Silakan tambahkan menu terlebih dahulu.', {
        icon: null,
        style: {
          borderRadius: '8px',
          background: '#333',
          color: '#fff',
          padding: '12px 16px',
        },
      });
      return;
    }

    if (!canNavigate) {
      e.preventDefault();
      toast.error('Silakan pilih nomor meja terlebih dahulu dari halaman menu.', {
        icon: null,
        style: {
          borderRadius: '8px',
          background: '#333',
          color: '#fff',
          padding: '12px 16px',
        },
      });
    }
  };

  return (
    <>
      {/* Toaster diletakkan di sini agar bisa muncul di atas Navbar jika diperlukan */}
      <Toaster position="top-center" reverseOrder={false} />
      <Link
        href={cartLink}
        onClick={handleClick}
        className="relative inline-flex items-center"
      >
        <ShoppingCartIcon className="w-6 h-6 text-white" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full px-1.5 py-0.5">
            {totalItems}
          </span>
        )}
      </Link>
    </>
  );
}
