'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

interface KasirReport {
  id: string
  name: string
  total_sales: number
  total_minutes: number
}

interface ItemReport {
  name: string
  total_sold: number
}

export default function LaporanKasirPage() {
  const [kasirData, setKasirData] = useState<KasirReport[]>([])
  const [itemData, setItemData] = useState<ItemReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLaporan = async () => {
      setLoading(true)
      setError(null)

      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'kasir')

      const { data: shifts, error: shiftError } = await supabase
        .from('shifts')
        .select('id, kasir_id, start_time, end_time')
        .not('end_time', 'is', null)

      const { data: salesLogs, error: salesError } = await supabase
        .from('sales_logs')
        .select('kasir_id, total_price')

      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('menu_item_id, quantity')

      const { data: menuItems, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('id, name')

      if (userError || shiftError || salesError || orderItemsError || menuItemsError || !users || !shifts || !salesLogs || !orderItems || !menuItems) {
        setError('Gagal mengambil data dari server')
        setLoading(false)
        return
      }

      // ===== Laporan Kasir =====
      const laporanKasir: KasirReport[] = users.map((kasir) => {
        const kasirShifts = shifts.filter((s) => s.kasir_id === kasir.id)
        const totalMinutes = kasirShifts.reduce((total, s) => {
          const start = new Date(s.start_time)
          const end = new Date(s.end_time)
          return total + (end.getTime() - start.getTime()) / 1000 / 60
        }, 0)

        const kasirSales = salesLogs.filter((s) => s.kasir_id === kasir.id)
        const totalSales = kasirSales.reduce((sum, s) => sum + s.total_price, 0)

        return {
          id: kasir.id,
          name: kasir.name,
          total_sales: totalSales,
          total_minutes: Math.round(totalMinutes),
        }
      })

      // ===== Laporan Barang Terjual =====
      const menuMap = new Map(menuItems.map(item => [item.id, item.name]))
      const itemCountMap = new Map<string, number>()

      for (const item of orderItems) {
        const name = menuMap.get(item.menu_item_id) || 'Unknown'
        const current = itemCountMap.get(name) || 0
        itemCountMap.set(name, current + item.quantity)
      }

      const laporanBarang: ItemReport[] = Array.from(itemCountMap.entries()).map(([name, total_sold]) => ({
        name,
        total_sold,
      })).sort((a, b) => b.total_sold - a.total_sold)

      setKasirData(laporanKasir)
      setItemData(laporanBarang)
      setLoading(false)
    }

    fetchLaporan()
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-gray-800">📊 Laporan</h1>

      {/* Navigasi laporan */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['harian', 'mingguan', 'bulanan', 'tahunan'].map((tipe) => (
          <Link
            key={tipe}
            href={`/admin/laporan/${tipe}`}
            className="text-center bg-gradient-to-tr from-red-500 to-red-600 text-white py-3 rounded-lg shadow hover:shadow-md transition hover:brightness-110"
          >
            Laporan {tipe.charAt(0).toUpperCase() + tipe.slice(1)}
          </Link>
        ))}
      </div>

      {/* Dua Tabel: Kasir & Barang Terjual */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : error ? (
        <p className="text-red-600 font-medium">{error}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tabel Laporan Kasir */}
          <section className="overflow-x-auto border rounded-md shadow-sm">
            <h2 className="text-lg font-semibold px-4 py-2 bg-gray-100 border-b">🧾 Laporan Kasir</h2>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">👤 Nama Kasir</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-700">💰 Total Penjualan</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-700">⏱️ Durasi Shift</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {kasirData.map((kasir, idx) => (
                  <tr
                    key={kasir.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-3 text-gray-800">{kasir.name}</td>
                    <td className="px-6 py-3 text-green-700 text-right">
                      Rp {kasir.total_sales.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-right">
                      {Math.floor(kasir.total_minutes / 60)} jam {kasir.total_minutes % 60} menit
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Tabel Barang Terjual */}
          <section className="overflow-x-auto border rounded-md shadow-sm">
            <h2 className="text-lg font-semibold px-4 py-2 bg-gray-100 border-b">🍽️ Barang Terjual</h2>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">📦 Nama Menu</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-700">🔢 Jumlah Terjual</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {itemData.map((item, idx) => (
                  <tr key={item.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-3 text-gray-800">{item.name}</td>
                    <td className="px-6 py-3 text-gray-600 text-right">{item.total_sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  )
}
