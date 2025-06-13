"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormMenuProps {
  onSubmit: (formData: any) => Promise<void>;
}

export function FormMenu({ onSubmit }: FormMenuProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    size_option: "",
    price_r: "",
    price_l: "",
    price: "",
    is_available: true,
    imageFile: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      router.push("/admin/menu");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Menu
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none"
          >
            <option value="">Pilih Kategori</option>
            <option value="makanan">Makanan</option>
            <option value="minuman">Minuman</option>
            <option value="dessert">Dessert</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opsi Ukuran
          </label>
          <select
            value={formData.size_option}
            onChange={(e) => setFormData({ ...formData, size_option: e.target.value })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none"
          >
            <option value="">Tidak Ada</option>
            <option value="regular">Regular</option>
            <option value="large">Large</option>
          </select>
        </div>

        {formData.size_option === "regular" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Regular
            </label>
            <input
              type="number"
              required
              value={formData.price_r}
              onChange={(e) => setFormData({ ...formData, price_r: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none"
            />
          </div>
        )}

        {formData.size_option === "large" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Large
            </label>
            <input
              type="number"
              required
              value={formData.price_l}
              onChange={(e) => setFormData({ ...formData, price_l: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none"
            />
          </div>
        )}

        {!formData.size_option && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga
            </label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gambar Menu
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFormData({ ...formData, imageFile: file });
              }
            }}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_available"
            checked={formData.is_available}
            onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700">
            Menu Tersedia
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center items-center gap-2 py-2 px-4 text-white rounded-md font-medium transition ${
          loading ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {loading ? "Menyimpan..." : "Simpan Menu"}
      </button>
    </form>
  );
} 