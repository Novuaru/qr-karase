"use client";
import Link from "next/link";
import { BarChart4, CalendarDays, CalendarRange, CalendarCheck2, CalendarX2 } from "lucide-react";

export default function LaporanIndexPage() {
  const laporan = [
    { href: "/kasir/laporan/harian", label: "Laporan Harian", icon: <CalendarDays className="w-6 h-6 text-red-600" /> },
    { href: "/kasir/laporan/mingguan", label: "Laporan Mingguan", icon: <CalendarRange className="w-6 h-6 text-orange-500" /> },
    { href: "/kasir/laporan/bulanan", label: "Laporan Bulanan", icon: <CalendarCheck2 className="w-6 h-6 text-blue-600" /> },
    { href: "/kasir/laporan/tahunan", label: "Laporan Tahunan", icon: <CalendarX2 className="w-6 h-6 text-green-600" /> },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-red-700 mb-6 flex items-center gap-2">
        <BarChart4 className="w-8 h-8 text-red-700" />
        Pilih Jenis Laporan
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {laporan.map((lapor, i) => (
          <Link key={i} href={lapor.href} className="group">
            <div className="flex items-center gap-4 p-4 border border-gray-300 rounded-xl shadow-sm hover:shadow-md hover:border-red-400 transition duration-300 bg-white">
              <div className="p-2 bg-red-50 rounded-lg group-hover:scale-105 transition">
                {lapor.icon}
              </div>
              <span className="text-lg font-medium text-gray-800 group-hover:text-red-700">
                {lapor.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
