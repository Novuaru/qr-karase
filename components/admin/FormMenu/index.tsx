"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type FormMenuProps = {
  initialData?: {
    name: string;
    category: string;
    size_option?: string;
    price_r?: number;
    price_l?: number;
    price?: number;
    is_available?: boolean;
    image_url?: string;
  };
  onSubmit: (data: any) => void | Promise<void>;
};

export default function FormMenu({ initialData, onSubmit }: FormMenuProps) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    size_option: initialData?.size_option || "",
    price_r: initialData?.price_r || 0,
    price_l: initialData?.price_l || 0,
    price: initialData?.price || 0,
    is_available: initialData?.is_available ?? true,
    imageFile: null as File | null,
    imagePreview: initialData?.image_url || "",
  });

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (file) {
      setForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6 max-w-3xl mx-auto border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800">Form Menu</h2>

      <div className="grid gap-1">
        <label className="text-sm font-medium text-gray-700">Nama Menu</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2"
          placeholder="Contoh: Nasi Goreng Special"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-medium text-gray-700">Kategori</label>
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2"
          placeholder="Contoh: Makanan"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-medium text-gray-700">Ukuran (opsional)</label>
        <input
          type="text"
          name="size_option"
          value={form.size_option}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2"
          placeholder="Contoh: R,L"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-1">
          <label className="text-sm font-medium text-gray-700">Harga R</label>
          <input
            type="number"
            name="price_r"
            value={form.price_r}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium text-gray-700">Harga L</label>
          <input
            type="number"
            name="price_l"
            value={form.price_l}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium text-gray-700">Harga Tetap</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 mt-2">
        <input
          type="checkbox"
          name="is_available"
          checked={form.is_available}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label className="text-sm text-gray-700">Tersedia</label>
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-medium text-gray-700">Gambar Menu</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full max-w-xs"
        />
        {form.imagePreview && (
          <img
            src={form.imagePreview}
            alt="Preview"
            className="mt-3 rounded-lg border object-cover max-h-52 w-auto"
          />
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold transition-all duration-200"
      >
        Simpan Menu
      </button>
    </form>
  );
} 