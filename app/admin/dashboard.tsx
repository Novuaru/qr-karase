// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalMenuItems: 0,
    totalRestaurants: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const { data: salesData } = await supabase
        .from("sales_logs")
        .select("total_price");

      const { data: ordersData } = await supabase
        .from("orders")
        .select("id");

      const { data: menuData } = await supabase
        .from("menu_items")
        .select("id");

      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("id");

      setStats({
        totalSales:
          salesData?.reduce((acc, curr) => acc + curr.total_price, 0) || 0,
        totalOrders: ordersData?.length || 0,
        totalMenuItems: menuData?.length || 0,
        totalRestaurants: restaurantData?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Admin</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm text-gray-500 font-medium mb-2">Total Penjualan</h3>
            <p className="text-3xl font-bold text-gray-900">
              Rp {stats.totalSales.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm text-gray-500 font-medium mb-2">Total Pesanan</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm text-gray-500 font-medium mb-2">Total Menu</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalMenuItems}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm text-gray-500 font-medium mb-2">Total Restoran</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalRestaurants}</p>
          </div>
        </div>

        {/* Admin Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/orders"
            className="block text-center bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-4 px-6 rounded-xl shadow"
          >
            Kelola Pesanan
          </Link>
          <Link
            href="/admin/menu"
            className="block text-center bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-4 px-6 rounded-xl shadow"
          >
            Kelola Menu
          </Link>
          <Link
            href="/admin/restaurants"
            className="block text-center bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-4 px-6 rounded-xl shadow"
          >
            Kelola Restoran
          </Link>
          <Link
            href="/admin/reports"
            className="block text-center bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold py-4 px-6 rounded-xl shadow"
          >
            Laporan Penjualan
          </Link>
          <Link
            href="/admin/shifts"
            className="block text-center bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold py-4 px-6 rounded-xl shadow"
          >
            Manajemen Shift
          </Link>
        </div>
      </div>
    </div>
  );
}
