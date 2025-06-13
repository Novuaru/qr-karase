'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

type Props = {
  rentang: 'harian' | 'mingguan' | 'bulanan' | 'tahunan'
}

export default function LaporanPenjualan({ rentang }: Props) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const today = new Date()
      let from: Date

      switch (rentang) {
        case 'harian':
          from = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          break
        case 'mingguan':
          from = new Date(today.setDate(today.getDate() - 7))
          break
        case 'bulanan':
          from = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
          break
        case 'tahunan':
          from = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
          break
        default:
          from = new Date()
      }

      const { data, error } = await supabase
        .from('sales_logs')
        .select('*')
        .gte('timestamp', from.toISOString())
        .order('timestamp', { ascending: false })

      if (error) {
        console.error(error)
      } else {
        setData(data)
      }

      setLoading(false)
    }

    fetchData()
  }, [rentang])

  if (loading) return <p>Memuat laporan...</p>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold capitalize">Laporan {rentang}</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Tanggal</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Kasir</th>
          </tr>
        </thead>
        <tbody>
          {data.map((log) => (
            <tr key={log.id}>
              <td className="border p-2">{format(new Date(log.timestamp), 'dd/MM/yyyy')}</td>
              <td className="border p-2">Rp{log.total_amount.toLocaleString()}</td>
              <td className="border p-2">{log.user_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
