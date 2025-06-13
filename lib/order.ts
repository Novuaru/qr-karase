import { createClient } from "@/utils/supabase/client";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurant_id: string;
};

export async function submitOrder(cart: CartItem[]) {
  const supabase = createClient();

  if (cart.length === 0) {
    throw new Error("Keranjang kosong");
  }

  const restaurant_id = cart[0].restaurant_id;
  if (!restaurant_id) {
    throw new Error("Data restoran tidak tersedia pada item pesanan.");
  }

  // Insert ke orders
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ status: "pending", restaurant_id })
    .select()
    .single();

  if (orderError || !order) {
    throw orderError || new Error("Gagal membuat pesanan");
  }

  const order_id = order.id;

  // Insert ke order_items
  const items = cart.map((item) => ({
    order_id,
    menu_item_id: item.id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(items);

  if (itemsError) {
    throw itemsError;
  }

  return order_id;
}
