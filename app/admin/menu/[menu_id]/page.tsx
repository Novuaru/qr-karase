'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, Trash2 } from 'lucide-react'

type MenuItem = {
  id: string
  name: string
  price: number
  category?: string
  is_available: boolean
  image_url?: string
  is_best_seller?: boolean
  is_promo?: boolean
  promo_price?: number | null
  promo_description?: string | null
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

      if (error) return

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
      alert('Harga tidak valid.')
      setSaving(false)
      return
    }

    if (imageFile) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type)) {
        alert('Format gambar harus JPG, PNG, atau WEBP.')
        setSaving(false)
        return
      }

      if (imageFile.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 2MB.')
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
        alert('Gagal mengunggah gambar.')
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
        is_best_seller: values.is_best_seller || false,
        is_promo: values.is_promo || false,
        promo_price: values.is_promo ? values.promo_price : null,
        promo_description: values.is_promo ? values.promo_description : null,
      })
      .eq('id', menu_id)

    setSaving(false)

    if (error) {
      alert('Gagal menyimpan perubahan.')
    } else {
      alert('Menu berhasil diperbarui.')
      router.push('/admin/menu')
    }
  }

  const handleDelete = async () => {
    if (!menu_id) return
    if (!confirm('Yakin ingin menghapus menu ini?')) return

    setDeleting(true)
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', menu_id)
    setDeleting(false)

    if (error) {
      alert('Gagal menghapus menu. Pastikan tidak ada relasi dengan data pesanan.')
    } else {
      alert('Menu berhasil dihapus.')
      router.push('/admin/menu')
    }
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    let newValue: any

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked
    } else if (name === 'price' || name === 'promo_price') {
      newValue = parseFloat(value)
    } else {
      newValue = value
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImageFile(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.price) {
      alert('Nama dan harga wajib diisi.')
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
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
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
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Kategori</label>
        <select
          name="category"
          value={form.category || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
        >
          <option value="">-- Pilih Kategori --</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_best_seller"
          checked={form.is_best_seller || false}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-sm font-medium text-gray-700">Best Seller</label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_promo"
          checked={form.is_promo || false}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-sm font-medium text-gray-700">Promo Aktif</label>
      </div>

      {form.is_promo && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Harga Promo</label>
            <input
              type="number"
              name="promo_price"
              value={form.promo_price ?? ''}
              onChange={handleChange}
              min={0}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deskripsi Promo</label>
            <textarea
              name="promo_description"
              value={form.promo_description ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Status Ketersediaan</label>
        <select
          name="is_available"
          value={form.is_available ? 'true' : 'false'}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              is_available: e.target.value === 'true',
            }))
          }
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
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
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
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
