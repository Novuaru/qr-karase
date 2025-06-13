'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabaseClient'

type Restoran = {
  id: string
  name: string
  location: string
  logo_url: string
}

export default function RestoranPage() {
  const [restorans, setRestorans] = useState<Restoran[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    fetchRestorans()
  }, [])
  
  const fetchRestorans = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error(error.message)
      toast.error('Gagal mengambil data restoran.')
    }
    else setRestorans(data || [])
    setLoading(false)
  }

  const uploadLogo = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage.from('restaurant-logos').upload(fileName, file)
    if (error || !data?.path) {
      toast.error('Gagal mengunggah logo.')
      throw new Error('Upload gagal')
    }

    const { data: publicUrlData } = supabase.storage.from('restaurant-logos').getPublicUrl(data.path)
    return publicUrlData.publicUrl
  }

  const resetForm = () => {
    setEditId(null)
    setName('')
    setLocation('')
    setLogo(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !location || (!editId && !logo)) {
      toast.error('Nama, lokasi, dan logo wajib diisi.')
      return
    }

    setLoading(true)
    try {
      const logo_url = logo ? await uploadLogo(logo) : undefined
      const data = { name, location, ...(logo_url && { logo_url }) }

      const { error } = editId
        ? await supabase.from('restaurants').update(data).eq('id', editId)
        : await supabase.from('restaurants').insert([data])

      if (error) throw error

      toast.success(editId ? 'Restoran berhasil diperbarui!' : 'Restoran berhasil ditambahkan!')
      resetForm()
      fetchRestorans()
    } catch (err: any) {
      console.error(err.message)
      toast.error(editId ? 'Gagal memperbarui restoran.' : 'Gagal menambahkan restoran.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    toast(
      (t) => (
        <div className="flex flex-col items-center p-1">
          <p className="mb-3 text-sm font-medium text-gray-800">
            Yakin ingin menghapus restoran ini?
          </p>
          <div className="flex gap-2">
            <button
              className="px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-semibold shadow-md transition-all duration-150 ease-in-out"
              onClick={async () => {
                toast.dismiss(t.id)
                setLoading(true)
                const { error } = await supabase.from('restaurants').delete().eq('id', id)
                if (error) {
                  console.error(error.message)
                  toast.error('Gagal menghapus restoran.')
                } else {
                  toast.success('Restoran berhasil dihapus.')
                  fetchRestorans()
                }
                setLoading(false)
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
      {
        duration: Infinity,
        position: 'top-center',
      }
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-red-700">🍽 Kelola Restoran</h1>

      {/* Form Tambah / Edit */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-md rounded-xl p-6 border border-red-200 mb-10">
        <input
          type="text"
          placeholder="Nama restoran"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-red-300 focus:border-red-500 focus:ring-red-500 rounded p-2"
        />
        <input
          type="text"
          placeholder="Lokasi restoran"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border border-red-300 focus:border-red-500 focus:ring-red-500 rounded p-2"
        />

        {editId && (
          <div>
            <p className="text-sm text-gray-600">Logo saat ini:</p>
            <img
              src={restorans.find(r => r.id === editId)?.logo_url}
              alt="Logo"
              className="w-20 h-20 rounded object-cover mb-2 border border-gray-200"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
          className="w-full"
          required={!editId}
        />

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition"
          >
            {loading ? 'Menyimpan...' : editId ? 'Update' : 'Tambah'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="border border-gray-400 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Daftar Restoran */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : restorans.length === 0 ? (
        <p className="text-gray-600">Belum ada restoran.</p>
      ) : (
        restorans.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4 mb-4 bg-white rounded-xl shadow ring-1 ring-red-100">
            <div className="flex items-center gap-4">
              <img src={r.logo_url} alt={r.name} className="w-16 h-16 object-cover rounded-full border border-red-300" />
              <div>
                <h3 className="font-semibold text-red-700">{r.name}</h3>
                <p className="text-sm text-gray-600">{r.location}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="text-sm text-red-600 hover:underline"
                onClick={() => {
                  setEditId(r.id)
                  setName(r.name)
                  setLocation(r.location)
                  setLogo(null)
                }}
              >
                Edit
              </button>
              <button
                className="text-sm text-gray-500 hover:text-red-700"
                onClick={() => handleDelete(r.id)}
              >
                Hapus
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
