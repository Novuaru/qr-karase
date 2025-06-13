'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { Loader2, Trash2 } from 'lucide-react'

type MenuItem = {
  id: string
  name: string
  price: number
  category?: string
  is_available: boolean
  image_url?: string
}

export default function EditMenuPage() {
  const { menu_id } = useParams()
  const router = useRouter()

  const [menu, setMenu] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', menu_id)
        .single()

      if (error || !data) {
        setError('Menu tidak ditemukan.')
      } else {
        setMenu(data)
      }
      setLoading(false)
    }

    if (menu_id) fetchMenu()
  }, [menu_id])

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('category')

      if (error) {
        console.error('Gagal mengambil kategori:', error)
        return
      }

      const unique = Array.from(
        new Set(data.map((item) => item.category).filter(Boolean))
      ) as string[]

      setCategories(unique)
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (values: MenuItem, imageFile?: File | null) => {
    if (!menu_id) return
    setSaving(true)

    let imageUrl = values.image_url
    const price = parseFloat(String(values.price))

    if (isNaN(price)) {
      toast.error('Harga tidak valid.')
      setSaving(false)
      return
    }

    if (imageFile) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type)) {
        toast.error('Format gambar harus JPG, PNG, atau WEBP.')
        setSaving(false)
        return
      }

      if (imageFile.size > 2 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 2MB.')
        setSaving(false)
        return
      }

      const filename = `${menu_id}-${Date.now()}-${imageFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filename, imageFile, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        toast.error('Gagal mengunggah gambar.')
        setSaving(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filename)

      imageUrl = publicUrlData?.publicUrl || imageUrl
    }

    const { error } = await supabase
      .from('menu_items')
      .update({
        name: values.name,
        price,
        category: values.category || '',
        is_available: values.is_available,
        image_url: imageUrl,
      })
      .eq('id', menu_id)

    setSaving(false)

    if (error) {
      toast.error('Gagal menyimpan perubahan.')
    } else {
      toast.success('Menu berhasil diperbarui.')
      setTimeout(() => {
        router.push('/admin/menu')
      }, 1500) // Jeda 1.5 detik sebelum pindah halaman
    }
  }

  const handleDelete = async () => {
    if (!menu_id) return

    toast(
      (t) => (
        <div className="flex flex-col items-center p-1">
          <p className="mb-3 text-sm font-medium text-gray-800">
            Yakin ingin menghapus menu ini?
          </p>
          <div className="flex gap-2">
            <button
              className="px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-semibold shadow-md transition-all duration-150 ease-in-out"
              onClick={async () => {
                toast.dismiss(t.id)
                setDeleting(true)
                const { error: deleteError } = await supabase
                  .from('menu_items')
                  .delete()
                  .eq('id', menu_id)
                setDeleting(false)
                if (deleteError) {
                  toast.error(
                    'Gagal menghapus menu. Pastikan tidak ada relasi dengan data pesanan.',
                    { duration: 4000 }
                  )
                } else {
                  toast.success('Menu berhasil dihapus.', { duration: 3000 })
                  setTimeout(() => {
                    router.push('/admin/menu')
                  }, 2500) // Jeda 2.5 detik, sedikit sebelum toast hilang
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
      {
        duration: Infinity, // Biarkan toast terbuka sampai pengguna berinteraksi
        position: 'top-center',
      }
    )
  }
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    )

  if (error)
    return (
      <p className="text-center text-red-600 text-lg font-semibold mt-20">{error}</p>
    )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Menu</h1>

      {menu && (
        <FormEditMenu
          initialValues={menu}
          onSubmit={handleSubmit}
          loading={saving}
          categories={categories}
        />
      )}

      <div className="mt-8 text-right">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center px-4 py-2 bg-gray-200 text-red-600 rounded-md hover:bg-gray-300 disabled:opacity-50 transition"
        >
          {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          <Trash2 className="w-4 h-4 mr-2" />
          Hapus Menu
        </button>
      </div>
    </div>
  )
}

function FormEditMenu({
  initialValues,
  onSubmit,
  loading,
  categories = [],
}: {
  initialValues: MenuItem
  onSubmit: (values: MenuItem, imageFile?: File | null) => void
  loading: boolean
  categories?: string[]
}) {
  const [form, setForm] = useState<MenuItem>(initialValues)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    setForm(initialValues)
    setImageFile(null)
  }, [initialValues])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'is_available' ? value === 'true' : value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImageFile(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.price) {
      toast.error('Nama dan harga wajib diisi.')
      return
    }

    onSubmit(form, imageFile)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nama Menu</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Harga</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          required
          min={0}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Kategori</label>
        <select
          name="category"
          value={form.category || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
        >
          <option value="">-- Pilih Kategori --</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="__new">+ Tambah Kategori Baru</option>
        </select>

        {form.category === '__new' && (
          <input
            type="text"
            name="category"
            placeholder="Kategori baru"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, category: e.target.value }))
            }
            className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status Ketersediaan</label>
        <select
          name="is_available"
          value={form.is_available ? 'true' : 'false'}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
        >
          <option value="true">Tersedia</option>
          <option value="false">Tidak Tersedia</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Gambar</label>
        {form.image_url ? (
          <img
            src={form.image_url}
            alt="Gambar Menu"
            className="w-32 h-32 object-cover rounded mb-2 border border-gray-300"
          />
        ) : (
          <div className="w-32 h-32 flex items-center justify-center border border-dashed border-gray-300 mb-2 text-sm text-gray-400">
            Tidak ada gambar
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Menyimpan...
          </>
        ) : (
          'Simpan Perubahan'
        )}
      </button>
    </form>
  )
}
