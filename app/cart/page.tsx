import { Suspense } from 'react';
import ClientCart from './ClientCart';

export default function CartPage() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Keranjang Pesanan</h1>
      <Suspense fallback={<p>Memuat keranjang...</p>}>
        <ClientCart />
      </Suspense>
    </main>
  );
}
