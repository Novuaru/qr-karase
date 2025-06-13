"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

type Restaurant = {
  id: string;
  name: string;
  logo_url: string;
  location: string | null;
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data, error } = await supabase.from("restaurants").select("*");
      if (error) console.error("Gagal mengambil data restoran:", error.message);
      else setRestaurants(data || []);
      setLoading(false);
    };

    fetchRestaurants();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <header className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-red-600 to-yellow-400 bg-clip-text text-transparent tracking-tight">
          Pilih Restoran Anda
        </h1>
        <p className="mt-3 text-gray-600 text-lg sm:text-xl">
          Silakan pilih salah satu restoran di bawah ini untuk mulai memesan.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center space-x-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-36 h-44 rounded-xl bg-gradient-to-br from-red-300 via-red-200 to-yellow-100 shadow-lg"
            />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <p className="text-center text-gray-400 text-lg italic">
          Belum ada restoran tersedia.
        </p>
      ) : (
        <div className="grid gap-8 sm:gap-10 grid-cols-[repeat(auto-fit,minmax(200px,1fr))] place-items-center">
          {restaurants.map((r) => (
            <Link
              key={r.id}
              href={`/restaurants/${r.id}/menu`}
              className="group w-full bg-gradient-to-br from-red-50 to-yellow-50 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 hover:border-red-400 transition transform hover:scale-105 overflow-hidden"
            >
              <div className="relative w-full h-40 bg-white bg-opacity-70 flex items-center justify-center p-6">
                <Image
                  src={r.logo_url}
                  alt={`Logo ${r.name}`}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 150px, 200px"
                />
              </div>
              <div className="px-5 py-3 text-center">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition">
                  {r.name}
                </h2>
                {r.location && (
                  <p className="text-sm text-gray-600 mt-1">{r.location}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
