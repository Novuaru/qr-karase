"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/background_image.jpg" // ← ganti dengan gambar estetik restoran
          alt="Background"
          fill
          priority
          className="object-cover blur-sm opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Content Container */}
      <div className="max-w-3xl mx-auto px-6 py-24 text-white text-center space-y-10">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/logo_pt_karase.png" // ← ganti dengan logo PT Karase
            alt="Logo PT Karase"
            width={100}
            height={100}
            className="mx-auto rounded-full shadow-lg ring-2 ring-white/20"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 drop-shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Tentang PT Karase
        </motion.h1>

        {/* Description */}
        <motion.div
          className="space-y-6 text-lg leading-relaxed text-white/90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p>
            <strong>PT Karase</strong> adalah penyedia solusi modern untuk pemesanan makanan berbasis QR. Kami membantu restoran menghadirkan layanan cepat dan efisien, langsung dari meja pelanggan.
          </p>
          <p>
            Cukup scan QR untuk melihat menu, memesan, dan bayar. Admin dan kasir mendapatkan dashboard lengkap untuk mengelola operasional harian, shift, dan laporan penjualan.
          </p>
          <p>
            Kami percaya bahwa teknologi dapat meningkatkan kualitas layanan di dunia kuliner. Bersama kami, transformasi digital restoran Anda dimulai sekarang.
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-sm text-white/60 pt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          &copy; {new Date().getFullYear()} 
        </motion.div>
      </div>
    </main>
  );
}
