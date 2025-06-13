import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

/** =========================
 *  RESTAURANTS
 *  ========================= */

export async function getAllRestaurants() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching restaurants:", error.message);
    return [];
  }

  return data;
}


/** =========================
 *  USERS / KASIR
 *  ========================= */
export async function getKasirList() {
  const { data, error } = await supabase
    .from("users")
    .select(`
      id, name, email, restaurant_id,
      restaurants(name)
    `)
    .eq("role", "kasir")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching kasir list:", error.message);
    return [];
  }

  return data.map((k) => ({
    ...k,
    restaurant_name: k.restaurants?.[0]?.name || "-",
  }));
}

export async function getKasirById(kasirId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", kasirId)
    .eq("role", "kasir")
    .single();

  if (error) {
    console.error("Error fetching kasir:", error.message);
    return null;
  }

  return data;
}

export async function createKasir(data: {
  name: string;
  email: string;
  password: string;
  restaurant_id: string;
}) {
  const { error } = await supabase.from("users").insert([
    {
      ...data,
      role: "kasir",
    },
  ]);

  if (error) {
    console.error("Error creating kasir:", error.message);
    throw error;
  }
}

export async function updateKasir(kasirId: string, data: Partial<{
  name: string;
  email: string;
  restaurant_id: string;
}>) {
  const { error } = await supabase
    .from("users")
    .update(data)
    .eq("id", kasirId)
    .eq("role", "kasir");

  if (error) {
    console.error("Error updating kasir:", error.message);
    throw error;
  }
}

export async function deleteKasir(kasirId: string) {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", kasirId)
    .eq("role", "kasir");

  if (error) {
    console.error("Error deleting kasir:", error.message);
    throw error;
  }
}

/** =========================
 *  MENU ITEMS
 *  ========================= */
export async function getMenuItems(restaurantId: string) {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching menu items:", error.message);
    return [];
  }

  return data;
}

export async function getMenuItemById(menuItemId: string) {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("id", menuItemId)
    .single();

  if (error) {
    console.error("Error fetching menu item:", error.message);
    return null;
  }

  return data;
}

export async function createMenuItem(data: any) {
  const { error } = await supabase.from("menu_items").insert([data]);
  if (error) {
    console.error("Error creating menu item:", error.message);
    throw error;
  }
}

export async function updateMenuItem(menuItemId: string, data: any) {
  const { error } = await supabase
    .from("menu_items")
    .update(data)
    .eq("id", menuItemId);

  if (error) {
    console.error("Error updating menu item:", error.message);
    throw error;
  }
}

export async function deleteMenuItem(menuItemId: string) {
  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", menuItemId);

  if (error) {
    console.error("Error deleting menu item:", error.message);
    throw error;
  }
}

export async function getAllMenuItems() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching menu items:", error.message);
    return [];
  }

  return data;
}

/** =========================
 *  ORDERS
 *  ========================= */
export async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error.message);
    return [];
  }

  return data;
}

