// app/cart/page.tsx
'use client';

import CartContentsClient from "@/components/CartContentsClient";

export default function CartPage() {
  return (
    <div className="p-6">
      <CartContentsClient />
    </div>
  );
}
