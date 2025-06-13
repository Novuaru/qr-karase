'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function FormMenu({ editData = null }: { editData?: any }) {
  const [form, setForm] = useState({
    name: editData?.name || '',
    price: editData?.price || '',
    image_url: editData?.image_url || '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const router = useRouter()

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleUploadImage = async () => {
    if (!imageFile) return form.image_url
    const fileName = `${Date.now()}-${imageFile.name}`
    const { data, error } = await supabase.storage.from('menu_images').upload(fileName, imageFile)
    if (error) throw error
    const { data: publicUrl } = supabase.storage.from('menu_images').getPublicUrl(fileName)
    return publicUrl?.publicUrl || ''
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const imageUrl = await handleUploadImage()

    if (editData) {
      await supabase.from('menu_items').update({ ...form, image_url: imageUrl }).eq('id', editData.id)
    } else {
      await supabase.from('menu_items').insert({ ...form, image_url: imageUrl })
    }

    router.push('/admin/menu')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" placeholder="Nama Menu" value={form.name} onChange={handleChange} className="input" />
      <input name="price" type="number" placeholder="Harga" value={form.price} onChange={handleChange} className="input" />
      <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="input" />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Simpan</button>
    </form>
  )
}
