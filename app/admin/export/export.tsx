"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchSalesLogs() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("sales_logs")
        .select(`
          id,
          total_price,
          created_at,
          kasir_id,
          order_id,
          shift_id
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data");
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function exportToExcel() {
    const salesLogs = await fetchSalesLogs();
    if (salesLogs.length === 0) {
      alert("Data tidak ditemukan atau kosong");
      return;
    }

    // Siapkan data untuk XLSX
    const worksheetData = salesLogs.map((log) => ({
      ID: log.id,
      TotalHarga: log.total_price,
      Tanggal: new Date(log.created_at).toLocaleString(),
      KasirID: log.kasir_id,
      OrderID: log.order_id,
      ShiftID: log.shift_id,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SalesLogs");

    const wbout = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([wbout], {
      type: "application/octet-stream",
    });

    saveAs(blob, `sales_logs_${new Date().toISOString()}.xlsx`);
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Ekspor Laporan Penjualan</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <button
        onClick={exportToExcel}
        disabled={loading}
        className={`px-6 py-3 rounded-lg text-white font-semibold transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {loading ? "Memproses..." : "Ekspor ke Excel"}
      </button>
    </div>
  );
}
