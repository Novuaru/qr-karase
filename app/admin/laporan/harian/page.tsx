'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

interface LaporanHarian {
  kasir_id: string
  kasir_name: string
  total_sales: number
  total_shift_minutes: number
}

export default function LaporanHarianPage() {
  const supabase = createClientComponentClient()
  const [data, setData] = useState<LaporanHarian[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()

      try {
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('id, name')
          .eq('role', 'kasir')

        const { data: shifts, error: shiftError } = await supabase
          .from('shifts')
          .select('id, kasir_id, start_time, end_time')
          .gte('start_time', todayISO)
          .not('end_time', 'is', null)

        const { data: salesLogs, error: salesError } = await supabase
          .from('sales_logs')
          .select('kasir_id, total_price, created_at')
          .gte('created_at', todayISO)

        if (userError || shiftError || salesError || !users || !shifts || !salesLogs) {
          setError('Gagal memuat data laporan.')
          setData([])
          return
        }

        const laporan: LaporanHarian[] = users.map((kasir) => {
          const kasirShifts = shifts.filter((s) => s.kasir_id === kasir.id)
          const kasirSales = salesLogs.filter((s) => s.kasir_id === kasir.id)

          const totalMinutes = kasirShifts.reduce((total, s) => {
            const start = new Date(s.start_time)
            const end = new Date(s.end_time)
            return total + (end.getTime() - start.getTime()) / 1000 / 60
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
    const header = ['Nama Kasir', 'Total Penjualan (Rp)', 'Total Jam Shift']
    const rows = data.map((row) => [
      row.kasir_name,
      row.total_sales,
      parseFloat((row.total_shift_minutes / 60).toFixed(2)),
    ])
    const sheetData = [header, ...rows]

    const ws = XLSX.utils.aoa_to_sheet(sheetData)

    // Kolom auto width
    ws['!cols'] = header.map((_, colIdx) => {
      const maxLen = Math.max(
        header[colIdx].length,
        ...rows.map((r) => String(r[colIdx]).length)
      )
      return { wch: maxLen + 4 }
    })

    // Styling cell (bold header, border, format angka)
    const range = XLSX.utils.decode_range(ws['!ref']!)
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R }
        const cell_ref = XLSX.utils.encode_cell(cell_address)
        const cell = ws[cell_ref]
        if (!cell) continue

        cell.s = {
          font: R === 0 ? { bold: true } : {},
          alignment: { horizontal: R === 0 ? 'center' : 'left' },
          border: {
            top: { style: 'thin', color: { rgb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
            left: { style: 'thin', color: { rgb: 'CCCCCC' } },
            right: { style: 'thin', color: { rgb: 'CCCCCC' } },
          },
          numFmt: C === 1 && R > 0 ? '#,##0' : undefined,
        }
      }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Harian Kasir')

    const buffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    })

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, `Laporan_Harian_Kasir_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📆 Laporan Harian Kasir</h1>
        {data.length > 0 && (
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow"
          >
            📤 Export ke Excel
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">Memuat data laporan...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="text-gray-500 italic">Tidak ada data laporan hari ini.</p>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="overflow-x-auto rounded border border-gray-300">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Nama Kasir</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">
                  Total Penjualan (Rp)
                </th>
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
