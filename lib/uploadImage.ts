import { supabase } from "./supabaseClient"

// lib/uploadImage.ts
export async function uploadImage(file: File) {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`
  const { data, error } = await supabase.storage
    .from('menu-images')
    .upload(fileName, file)

  if (error) throw error

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/menu-images/${fileName}`
  return imageUrl
}
