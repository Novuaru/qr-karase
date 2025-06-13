"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  ShoppingCart,
  Utensils,
  Store,
  Loader2,
  Star,
  Ghost,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalMenuItems: 0,
    totalRestaurants: 0,
  });

  const [chartData, setChartData] = useState<
    { date: string; sales: number; orders: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState("daily");

  const [bestSeller, setBestSeller] = useState<null | {
    name: string;
    total: number;
  }>(null);
  const [leastSeller, setLeastSeller] = useState<null | {
    name: string;
    total: number;
  }>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);

      const { data: salesData } = await supabase
        .from("sales_logs")
        .select("total_price, created_at");
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, created_at");
      const { data: menuData } = await supabase
        .from("menu_items")
        .select("id");
      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("id");

      const { data: popularMenus } = await supabase
        .from("order_items")
        .select("menu_item_id, quantity");

      const { data: allMenus } = await supabase
        .from("menu_items")
        .select("id, name");

      const totalSales =
        salesData?.reduce((acc, curr) => acc + (curr.total_price ?? 0), 0) ?? 0;

      const salesByDate: Record<string, number> = {};
      const ordersByDate: Record<string, number> = {};

      salesData?.forEach((item) => {
        const date = new Date(item.created_at).toLocaleDateString("id-ID");
        salesByDate[date] = (salesByDate[date] || 0) + (item.total_price ?? 0);
      });

      ordersData?.forEach((item) => {
        const date = new Date(item.created_at).toLocaleDateString("id-ID");
        ordersByDate[date] = (ordersByDate[date] || 0) + 1;
      });

      const combinedDates = Array.from(
        new Set([...Object.keys(salesByDate), ...Object.keys(ordersByDate)])
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      const data = combinedDates.map((date) => ({
        date,
        sales: salesByDate[date] || 0,
        orders: ordersByDate[date] || 0,
      }));

      setStats({
        totalSales,
        totalOrders: ordersData?.length ?? 0,
        totalMenuItems: menuData?.length ?? 0,
        totalRestaurants: restaurantData?.length ?? 0,
      });

      setChartData(data);

      if (popularMenus && allMenus) {
        const totalPerMenu: Record<string, number> = {};

        for (const item of popularMenus) {
          const id = item.menu_item_id;
          totalPerMenu[id] = (totalPerMenu[id] || 0) + (item.quantity ?? 0);
        }

        const withName = allMenus.map((menu) => ({
          name: menu.name,
          id: menu.id,
          total: totalPerMenu[menu.id] || 0,
        }));

        const sorted = withName.sort((a, b) => b.total - a.total);

        setBestSeller(sorted[0] ?? null);
        setLeastSeller(sorted[sorted.length - 1] ?? null);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterPeriod(e.target.value);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-white to-gray-100 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Dashboard Admin
        </h1>

        <div className="flex items-center gap-3">
          <label htmlFor="filterPeriod" className="font-medium text-gray-700">
            Filter Periode:
          </label>
          <select
            id="filterPeriod"
            value={filterPeriod}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          >
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 ring-1 ring-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Grafik Penjualan & Pesanan
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#10B981"
                strokeWidth={2}
                name="Penjualan"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Pesanan"
              />
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<BarChart3 className="w-6 h-6 text-emerald-500" />}
            label="Total Penjualan"
            value={`Rp ${stats.totalSales.toLocaleString("id-ID")}`}
          />
          <StatCard
            icon={<ShoppingCart className="w-6 h-6 text-blue-500" />}
            label="Total Pesanan"
            value={stats.totalOrders}
          />
          <StatCard
            icon={<Utensils className="w-6 h-6 text-pink-500" />}
            label="Total Menu"
            value={stats.totalMenuItems}
          />
          <StatCard
            icon={<Store className="w-6 h-6 text-yellow-500" />}
            label="Total Restoran"
            value={stats.totalRestaurants}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard
            icon={<Star className="w-6 h-6 text-green-600" />}
            label="Menu Paling Laris"
            value={bestSeller ? `${bestSeller.name} (${bestSeller.total}x)` : "Tidak ada data"}
          />
          <StatCard
            icon={<Ghost className="w-6 h-6 text-gray-500" />}
            label="Menu Sepi Peminat"
            value={leastSeller ? `${leastSeller.name} (${leastSeller.total}x)` : "Tidak ada data"}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Kelola Menu"
            href="/admin/menu"
            description="Tambah, edit, atau hapus menu makanan dan minuman"
          />
          <QuickActionCard
            title="Kelola Kasir"
            href="/admin/kasir"
            description="Kelola akun kasir dan akses mereka"
          />
          <QuickActionCard
            title="Kelola Restoran"
            href="/admin/restoran"
            description="Kelola data dan informasi restoran"
          />
          <QuickActionCard
            title="Laporan"
            href="/admin/laporan"
            description="Lihat laporan penjualan dan kinerja"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex items-center gap-3 sm:gap-4 ring-1 ring-gray-100 hover:ring-emerald-300 transition-all duration-200">
      <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
        <p className="text-lg sm:text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  href,
  description,
}: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl shadow-sm p-5 ring-1 ring-gray-100 hover:ring-emerald-300 hover:shadow-md transition-all duration-200 block"
    >
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </Link>
  );
}
