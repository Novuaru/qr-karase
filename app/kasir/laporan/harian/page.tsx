"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { CalendarDays, User2, Receipt, CalendarClock } from "lucide-react";

export default function LaporanHarian() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [tanggal, setTanggal] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("sales_logs")
        .select("*")
        .gte("created_at", `${tanggal}T00:00:00`)
        .lte("created_at", `${tanggal}T23:59:59`)
        .order("created_at", { ascending: false });

      if (!error) setData(data || []);
    };

    fetchData();
  }, [tanggal]);

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="w-8 h-8 text-red-600" />
        <h1 className="text-2xl font-bold text-red-700">Laporan Penjualan Harian</h1>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pilih Tanggal
        </label>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        />
      </div>

      {data.length === 0 ? (
        <p className="text-gray-500 italic">Belum ada data penjualan untuk tanggal ini.</p>
      ) : (
        <ul className="space-y-4">
          {data.map((log, idx) => (
            <li
              key={idx}
              className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarClock className="w-5 h-5 text-blue-600" />
                  <span>{format(new Date(log.created_at), "dd MMM yyyy • HH:mm")}</span>
                </div>
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <Receipt className="w-5 h-5" />
                  <span>{formatRupiah(log.total_amount)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User2 className="w-4 h-4 text-gray-500" />
                <span>Kasir: {log.kasir_name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
