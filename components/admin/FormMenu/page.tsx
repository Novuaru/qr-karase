import React, { useState } from "react";

interface FormMenuProps {
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export default function FormMenu({ onSubmit, loading }: FormMenuProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    imageFile: null as File | null,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, imageFile: e.target.files![0] }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nama Menu"
        required
      />
      <input
        type="text"
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="Kategori"
        required
      />
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="Harga"
        required
      />
      <input type="file" name="imageFile" onChange={handleFileChange} />
      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 bg-blue-600 text-white rounded ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Mengunggah..." : "Tambah Menu"}
      </button>
    </form>
  );
}
