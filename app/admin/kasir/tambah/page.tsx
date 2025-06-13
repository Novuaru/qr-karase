'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/navigation'

export default function TambahKasir() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { name, email, password } = form
    if (!name || !email || !password) {
      toast.error('Semua field wajib diisi.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('users').insert({
      name,
      email,
      password,
      role: 'kasir'
    })

    setLoading(false)

    if (error) {
      console.error(error)
      toast.error('Gagal menambahkan kasir.')
    } else {
      toast.success('Kasir berhasil ditambahkan!')
      setTimeout(() => {
        router.push('/admin/kasir')
      }, 1500) // Jeda 1.5 detik
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <h2 className="text-2xl font-bold mb-6 text-center">➕ Tambah Kasir</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama</label>
          <input
            type="text"
            placeholder="Nama Lengkap"
            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="Email aktif"
            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Minimal 6 karakter"
            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Simpan Kasir'}
        </button>
      </form>
    </div>
  )
}
