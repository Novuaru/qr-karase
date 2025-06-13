'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

interface LaporanKasir {
  kasir_id: string
  kasir_name: string
  total_sales: number
  total_shift_minutes: number
}

export default function LaporanMingguan() {
  const supabase = createClientComponentClient()
  const [data, setData] = useState<LaporanKasir[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      const today = new Date()
      const lastWeek = new Date()
      lastWeek.setDate(today.getDate() - 7)
      const lastWeekISO = lastWeek.toISOString()

      try {
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('id, name')
          .eq('role', 'kasir')

        const { data: shifts, error: shiftError } = await supabase
          .from('shifts')
          .select('id, kasir_id, start_time, end_time')
          .gte('start_time', lastWeekISO)
          .not('end_time', 'is', null)

        const { data: salesLogs, error: salesError } = await supabase
          .from('sales_logs')
          .select('kasir_id, total_price, created_at')
          .gte('created_at', lastWeekISO)

        if (userError || shiftError || salesError || !users || !shifts || !salesLogs) {
          setError('Gagal memuat data laporan.')
          return
        }

        const laporan: LaporanKasir[] = users.map((kasir) => {
          const kasirShifts = shifts.filter((s) => s.kasir_id === kasir.id)
          const kasirSales = salesLogs.filter((s) => s.kasir_id === kasir.id)

          const totalMinutes = kasirShifts.reduce((sum, s) => {
            const start = new Date(s.start_time)
            const end = new Date(s.end_time)
            return sum + (end.getTime() - start.getTime()) / 1000 / 60
          }, 0)

          const totalSales = kasirSales.reduce((sum, s) => sum + s.total_price, 0)

          return {
            kasir_id: kasir.id,
            kasir_name: kasir.name,
            total_sales: totalSales,
            total_shift_minutes: Math.round(totalMinutes),
          }
        })

        setData(laporan)
      } catch (err) {
        console.error(err)
        setError('Terjadi kesalahan saat mengambil data.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((row) => ({
        'Nama Kasir': row.kasir_name,
        'Total Penjualan (Rp)': row.total_sales,
        'Total Jam Shift': (row.total_shift_minutes / 60).toFixed(2),
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Mingguan')
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, `laporan_kasir_mingguan_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-red-700">📅 Laporan Mingguan</h1>
        {data.length > 0 && (
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            📤 Export ke Excel
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">Memuat data laporan mingguan...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && data.length === 0 && (
        <p className="text-gray-500 italic">Tidak ada data laporan minggu ini.</p>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="overflow-x-auto border rounded shadow-sm">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Nama Kasir</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Total Penjualan (Rp)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Durasi Shift</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map((kasir) => (
                <tr key={kasir.kasir_id}>
                  <td className="px-4 py-2 text-gray-800">{kasir.kasir_name}</td>
                  <td className="px-4 py-2 text-green-700 text-right">
                    {kasir.total_sales.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {(kasir.total_shift_minutes / 60).toFixed(2)} jam
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
