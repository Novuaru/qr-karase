// app/admin/kasir/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function KasirPage() {
  const [kasirList, setKasirList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKasir = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'kasir')
      if (error) {
        console.error(error)
        toast.error('Gagal mengambil data kasir.')
      } else {
        setKasirList(data || [])
      }
      setLoading(false)
    }
    fetchKasir()
  }, [])

  const deleteKasir = async (id: string) => {
    toast(
      (t) => (
        <div className="flex flex-col items-center p-1">
          <p className="mb-3 text-sm font-medium text-gray-800">
            Yakin ingin menghapus kasir ini?
          </p>
          <div className="flex gap-2">
            <button
              className="px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-semibold shadow-md transition-all duration-150 ease-in-out"
              onClick={async () => {
                toast.dismiss(t.id)
                const { error } = await supabase.from('users').delete().eq('id', id)
                if (error) {
                  toast.error('Gagal menghapus kasir.')
                  console.error(error)
                } else {
                  toast.success('Kasir berhasil dihapus.')
                  setKasirList((prev) => prev.filter((kasir) => kasir.id !== id))
                }
              }}
            >
              Ya, Hapus
            </button>
            <button
              className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-xs font-semibold shadow-md transition-all duration-150 ease-in-out"
              onClick={() => toast.dismiss(t.id)}
            >
              Batal
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center'}
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🧾 Manajemen Kasir</h1>
        <Link
          href="/admin/kasir/tambah"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Tambah Kasir
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data kasir...</p>
      ) : kasirList.length === 0 ? (
        <p className="text-gray-500">Belum ada kasir yang terdaftar.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kasirList.map((kasir) => (
            <li
              key={kasir.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col justify-between"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{kasir.name}</h3>
                <p className="text-sm text-gray-500">{kasir.email}</p>
              </div>
              <div className="flex justify-end gap-3">
                <Link
                  href={`/admin/kasir/${kasir.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteKasir(kasir.id)}
                  className="text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
