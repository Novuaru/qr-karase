// app/admin/export/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { saveAs } from 'file-saver'

export default function ExportPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const exportCSV = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sales_logs')
      .select(`
        id, total_price, created_at,
        orders(order_id: id, table_qr_id),
        users(name)
      `)

    if (error) {
      alert('Gagal mengambil data')
      setLoading(false)
      return
    }

    const rows = data.map((item: any) => ({
      ID: item.id,
      Total: item.total_price,
      Tanggal: item.created_at,
      Kasir: item.users?.name || '',
      Meja: item.orders?.table_qr_id || ''
    }))

    const csv = [
      Object.keys(rows[0]).join(','),
      ...rows.map(r => Object.values(r).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, `laporan-${new Date().toISOString()}.csv`)
    setLoading(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Export Data Penjualan</h1>
      <button
        onClick={exportCSV}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Mengekspor...' : 'Export ke CSV'}
      </button>
    </div>
  )
}
