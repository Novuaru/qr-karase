import { supabase } from "@/lib/supabaseClient";

type MenuItem = {
  restaurant_id: string;
  name: string;
  category: string;
  size_option?: string | null;
  price_r?: number | null;
  price_l?: number | null;
  price?: number | null;
  is_available?: boolean;
  image_url?: string;
};

export async function createMenuItem(payload: any) {
  const { data, error } = await supabase.from("menu_items").insert([payload]);
  if (error) throw new Error(error.message);
  return data;
}
