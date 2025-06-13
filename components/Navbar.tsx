'use client';

import Link from 'next/link';
import Image from 'next/image';
import CartIcon from './CartIcon';
import { usePathname } from 'next/navigation';

export const Navbar = () => {
  const pathname = usePathname();

  // Cek apakah sedang di halaman menu atau cart pelanggan
  const showCart =
    /^\/restaurants\/[^/]+\/menu$/.test(pathname) || pathname === '/cart';

  return (
    <header className="bg-gradient-to-r from-red-800 to-red-600 shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" title="Beranda" className="select-none">
          <Image
            src="/logo_pt_karase.png"
            alt="PT Karase"
            width={36}
            height={36}
            className="hover:opacity-80 transition"
            priority
          />
        </Link>

        {/* Navigasi */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          {showCart && <CartIcon />}
        </nav>
      </div>
    </header>
  );
};
