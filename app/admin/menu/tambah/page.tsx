'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabaseClient'

export default function TambahMenuPage() {
  const router = useRouter()

  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([])
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('')

  const [categories, setCategories] = useState<string[]>([])

  const [form, setForm] = useState({
    name: '',
    categorySelect: '',
    categoryNew: '',
    // Removed size_option, price_r, price_l
    price: '',
    is_available: true,
  })

  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Gagal mengambil data restoran:', error)
      } else {
        setRestaurants(data ?? [])
      }
    }
    fetchRestaurants()
  }, [])

  useEffect(() => {
    if (!selectedRestaurantId) {
      setCategories([])
      setForm((f) => ({ ...f, categorySelect: '', categoryNew: '' }))
      return
    }

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('category')
        .eq('restaurant_id', selectedRestaurantId)

      if (error) {
        console.error('Gagal mengambil kategori:', error)
        setCategories([])
      } else if (data) {
        const uniqueCats = Array.from(new Set(data.map((item) => item.category))).sort()
        setCategories(uniqueCats)
      }
    }
    fetchCategories()
  }, [selectedRestaurantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRestaurantId) {
      toast.error('Pilih restoran terlebih dahulu.')
      return
    }

    const finalCategory = form.categoryNew.trim() || form.categorySelect.trim()

    if (!form.name.trim() || !finalCategory) {
      toast.error('Nama dan kategori menu harus diisi.')
      return
    }

    setLoading(true)

    try {
      let image_url: string | null = null

      if (image) {
        const cleanedFileName = image.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9.-]/g, '')

        const fileName = `menu/${Date.now()}-${cleanedFileName}`

        const { data: storageData, error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, image, { upsert: true })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          toast.error('Gagal unggah gambar: ' + uploadError.message)
          setLoading(false)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('menu-images')
          .getPublicUrl(fileName)

        image_url = publicUrlData?.publicUrl ?? null
      }

      const { error } = await supabase.from('menu_items').insert({
        restaurant_id: selectedRestaurantId,
        name: form.name,
        category: finalCategory,
        // Removed size_option, price_r, price_l from insertion
        price: form.price ? parseInt(form.price) : null,
        is_available: form.is_available,
        image_url,
      })

      if (error) {
        toast.error('Gagal menambahkan menu: ' + error.message)
        console.error(error)
      } else {
        toast.success('Menu berhasil ditambahkan!')
        router.push('/admin/menu')
      }
    } catch (err) {
      console.error('Error saat submit:', err)
      toast.error('Terjadi kesalahan saat menambahkan menu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-2xl font-semibold mb-6 text-red-600">Tambah Menu</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <select
          value={selectedRestaurantId}
          onChange={(e) => setSelectedRestaurantId(e.target.value)}
          className="w-full border border-red-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
          disabled={loading}
        >
          <option value="">Pilih Restoran</option>
          {restaurants.map((resto) => (
            <option key={resto.id} value={resto.id}>
              {resto.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nama menu"
          className="w-full border border-red-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          disabled={loading}
        />

        <select
          value={form.categorySelect}
          onChange={(e) => setForm({ ...form, categorySelect: e.target.value, categoryNew: '' })}
          className="w-full border border-red-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={loading || !selectedRestaurantId}
        >
          <option value="">Pilih Kategori (atau ketik di bawah)</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Atau ketik kategori baru"
          className="w-full border border-red-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={form.categoryNew}
          onChange={(e) => setForm({ ...form, categoryNew: e.target.value, categorySelect: '' })}
          disabled={loading || !selectedRestaurantId}
        />

        {/* Removed Ukuran, Harga R, and Harga L input fields */}
        <input
          type="number"
          placeholder="Harga (opsional)"
          className="w-full border border-red-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          disabled={loading}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          disabled={loading}
          className="text-red-600"
        />

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
            disabled={loading}
            className="w-5 h-5 accent-red-400"
          />
          <span className="text-red-600 font-medium">Tersedia</span>
        </label>

        <button
          type="submit"
          className="w-full bg-red-400 hover:bg-red-500 text-white font-semibold py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Menu'}
        </button>
      </form>
    </div>
  )
}