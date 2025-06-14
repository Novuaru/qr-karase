// app/cart/page.tsx
import dynamic from "next/dynamic";
import { Suspense } from "react";

const CartContents = dynamic(() => "@/components/CartContentsClient", { ssr: false });

export default function CartPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-600">Memuat keranjang...</div>}>
      <CartContents />
    </Suspense>
  );
}
