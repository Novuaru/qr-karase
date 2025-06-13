// app/api/create-order/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const body = await req.json();

  const { items } = body;
  const restaurant_id = items[0].restaurant_id;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ restaurant_id, status: "pending" })
    .select()
    .single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    menu_item_id: item.id,
    name_snapshot: item.name,
    price_snapshot: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  return NextResponse.json({ order_id: order.id });
}
