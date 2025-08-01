'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function MenuList() {
  const [menus, setMenus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('menu_items').select('*')
      if (!error && data) setMenus(data)
      setLoading(false)
    }

    fetchMenus()
  }, [])

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-red-700 select-none">
          🍽️ Daftar Menu
        </h1>
        <Link
          href="/admin/menu/tambah"
          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold shadow-md transition"
        >
          + Tambah Menu
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : menus.length === 0 ? (
        <p className="text-center text-gray-500 italic">Belum ada menu tersedia.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {menus.map((menu) => (
            <Link
              key={menu.id}
              href={`/admin/menu/${menu.id}`}
              className="group block rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 relative"
            >
              {/* Gambar */}
              <div className="w-full h-40 bg-white flex items-center justify-center relative">
                {menu.image_url ? (
                  <img
                    src={menu.image_url}
                    alt={menu.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm text-gray-400 select-none">
                    Tidak ada gambar
                  </div>
                )}

                {/* Label Promo */}
                {menu.is_promo && (
                  <span className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded shadow">
                    PROMO
                  </span>
                )}

                {/* Label Best Seller */}
                {menu.is_best_seller && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                    BEST SELLER
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {menu.name}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Rp{menu.promo_price
                    ? menu.promo_price.toLocaleString('id-ID') + ' (Promo)'
                    : menu.price?.toLocaleString('id-ID')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
