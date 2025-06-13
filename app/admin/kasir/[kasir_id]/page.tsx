'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabaseClient'

export default function EditKasir() {
  const { kasir_id } = useParams()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(true) // For initial data fetch
  const [saving, setSaving] = useState(false) // For update operation
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        // @ts-ignore
        .eq('id', kasir_id)
        .single()

      if (data) {
        setForm({
          name: data.name || '',
          email: data.email || '',
          password: data.password || '',
        })
      } else {
        toast.error('Data kasir tidak ditemukan.')
        router.push('/admin/kasir') // Redirect if kasir not found
      }
      setLoading(false)
    }

    if (kasir_id) fetchData()
  }, [kasir_id, router])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('users').update(form).eq('id', kasir_id)
    setSaving(false)

    if (error) {
      toast.error('Gagal memperbarui data kasir.')
      console.error(error)
    } else {
      toast.success('Data kasir berhasil diperbarui!')
      setTimeout(() => {
        router.push('/admin/kasir')
      }, 1500) // Jeda 1.5 detik
    }
  }

  return (
    <main className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <Toaster position="top-center" reverseOrder={false} />
      <h2 className="text-2xl font-semibold text-red-700 mb-6 text-center">
        ✏️ Edit Data Kasir
      </h2>
      <form onSubmit={handleUpdate} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="Email aktif"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            placeholder="Kosongkan jika tidak ingin mengubah"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || saving}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
        </button>
      </form>
    </main>
  )
}
