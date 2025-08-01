'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
    size_option: '',
    price_r: '',
    price_l: '',
    price: '',
    is_available: true,
    is_promo: false,
    promo_price: '',
    promo_description: '',
    is_best_seller: false, // ✅ Tambahan
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
      alert('Pilih restoran terlebih dahulu')
      return
    }

    const finalCategory = form.categoryNew.trim() || form.categorySelect.trim()

    if (!form.name.trim() || !finalCategory) {
      alert('Nama dan kategori menu harus diisi')
      return
    }

    if (form.is_promo && !form.promo_price.trim()) {
      alert('Harga promo harus diisi jika menu dalam promo')
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

        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, image, { upsert: true })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          alert('Gagal upload gambar: ' + uploadError.message)
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
        size_option: form.size_option || null,
        price_r: form.price_r ? parseInt(form.price_r) : null,
        price_l: form.price_l ? parseInt(form.price_l) : null,
        price: form.price ? parseInt(form.price) : null,
        is_available: form.is_available,
        image_url,
        is_promo: form.is_promo,
        promo_price: form.promo_price ? parseInt(form.promo_price) : null,
        promo_description: form.promo_description || null,
        is_best_seller: form.is_best_seller, // ✅ Tambahan
      })

      if (error) {
        alert('Gagal menambahkan menu: ' + error.message)
        console.error(error)
      } else {
        alert('Menu berhasil ditambahkan')
        router.push('/admin/menu')
      }
    } catch (err) {
      console.error('Error saat submit:', err)
      alert('Terjadi kesalahan saat menambahkan menu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-red-600">Tambah Menu</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <select
          value={selectedRestaurantId}
          onChange={(e) => setSelectedRestaurantId(e.target.value)}
          className="w-full border border-red-300 rounded-md p-3"
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
          className="w-full border border-red-300 rounded-md p-3"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          disabled={loading}
        />

        <select
          value={form.categorySelect}
          onChange={(e) => setForm({ ...form, categorySelect: e.target.value, categoryNew: '' })}
          className="w-full border border-red-300 rounded-md p-3"
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
          className="w-full border border-red-300 rounded-md p-3"
          value={form.categoryNew}
          onChange={(e) => setForm({ ...form, categoryNew: e.target.value, categorySelect: '' })}
          disabled={loading || !selectedRestaurantId}
        />

        <input
          type="text"
          placeholder="Ukuran (opsional)"
          className="w-full border border-red-300 rounded-md p-3"
          value={form.size_option}
          onChange={(e) => setForm({ ...form, size_option: e.target.value })}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Harga R (opsional)"
            className="border border-red-300 rounded-md p-3"
            value={form.price_r}
            onChange={(e) => setForm({ ...form, price_r: e.target.value })}
            disabled={loading}
          />
          <input
            type="number"
            placeholder="Harga L (opsional)"
            className="border border-red-300 rounded-md p-3"
            value={form.price_l}
            onChange={(e) => setForm({ ...form, price_l: e.target.value })}
            disabled={loading}
          />
        </div>

        <input
          type="number"
          placeholder="Harga (opsional)"
          className="w-full border border-red-300 rounded-md p-3"
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

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={form.is_promo}
            onChange={(e) => setForm({ ...form, is_promo: e.target.checked })}
            disabled={loading}
            className="w-5 h-5 accent-red-400"
          />
          <span className="text-red-600 font-medium">Promo</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={form.is_best_seller}
            onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })}
            disabled={loading}
            className="w-5 h-5 accent-red-400"
          />
          <span className="text-red-600 font-medium">Best Seller</span>
        </label>

        {form.is_promo && (
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Harga Promo"
              className="w-full border border-red-300 rounded-md p-3"
              value={form.promo_price}
              onChange={(e) => setForm({ ...form, promo_price: e.target.value })}
              disabled={loading}
              required
            />
            <textarea
              placeholder="Deskripsi Promo"
              className="w-full border border-red-300 rounded-md p-3"
              value={form.promo_description}
              onChange={(e) => setForm({ ...form, promo_description: e.target.value })}
              disabled={loading}
            />
          </div>
        )}

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
