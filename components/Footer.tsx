'use client';

import Link from "next/link";
import { Instagram } from "lucide-react";
import { usePathname } from "next/navigation";

export const Footer = () => {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const showLoginButtons = pathname === "/restaurants";

  return (
    <footer className="bg-red-700 text-white text-xs py-4 mt-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        {/* Brand */}
        <div>
          <h2 className="font-semibold text-sm">🍽 PT Karase</h2>
          <p className="text-red-100">Khas Palembang</p>
        </div>

        {/* Kontak */}
        <div className="space-y-1">
          <a
            href="https://wa.me/6282177881616?text=Halo%20PT%20Karase"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-100 hover:text-white block"
          >
            📲 Reservasi 
          </a>
          <a
            href="https://www.instagram.com/kopi16.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-red-100 hover:text-white"
          >
            <Instagram size={12} /> @ptkarase
          </a>
        </div>

        {/* Jam */}
        <div className="text-red-100">
          <p>⏰ Sen–Jum 08.00–02.00</p>
          <p>⏰ Sab–Min 24 jam</p>
        </div>
      </div>

      {/* Login */}
      {showLoginButtons && (
        <div className="mt-3 flex justify-center gap-2">
          <Link
            href="/admin/login"
            className="bg-white text-red-700 px-2 py-1 rounded-full text-[10px] font-semibold shadow hover:bg-red-100"
          >
            🔐 Admin
          </Link>
          <Link
            href="/kasir/login"
            className="bg-white text-green-700 px-2 py-1 rounded-full text-[10px] font-semibold shadow hover:bg-green-100"
          >
            🧾 Kasir
          </Link>
        </div>
      )}

      <div className="mt-4 text-center text-red-200 text-[10px] border-t border-red-400 pt-2">
        &copy; {year} PT Karase. All rights reserved.
      </div>
    </footer>
  );
};
