'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Komponen Page Loader
const PageLoader = () => (
  <motion.div
    className="fixed inset-0 bg-gray-50 flex items-center justify-center z-[100]"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
  </motion.div>
);

export default function KasirLoginPage() {
  const router = useRouter();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [pageLoading, setPageLoading] = useState(true); // State untuk page loader
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 300); // Durasi loader
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!pageLoading) emailInputRef.current?.focus();
  }, [pageLoading]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // Cari user kasir berdasarkan email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', 'kasir')
        .single();

      if (error || !user) {
        setErrorMsg('Email tidak ditemukan.');
        setLoading(false);
        return;
      }

      // Validasi password
      if (user.password !== password) {
        setErrorMsg('Password salah.');
        setLoading(false);
        return;
      }

      // Buat shift baru untuk kasir
      const { data: newShift, error: shiftError } = await supabase
        .from('shifts')
        .insert({
          kasir_id: user.id,
          start_time: new Date().toISOString(),
          end_time: null,
        })
        .select()
        .single();

      if (shiftError || !newShift) {
        console.error(shiftError);
        setErrorMsg('Gagal mencatat shift.');
        setLoading(false);
        return;
      }

      // Simpan data kasir dan shift ke localStorage, termasuk id_kasir secara terpisah
      localStorage.setItem(
        'kasir',
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          restaurant_id: user.restaurant_id,
        })
      );
      localStorage.setItem('id_kasir', user.id);
      localStorage.setItem('shift_id', newShift.id);

      // Redirect ke dashboard kasir
      router.push('/kasir/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AnimatePresence>{pageLoading && <PageLoader />}</AnimatePresence>

      {!pageLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex min-h-screen items-center justify-center bg-gray-50 p-6"
        >
          <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md sm:max-w-lg">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-red-600 select-none">
              Login Kasir
            </h1>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  ref={emailInputRef}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="kasir@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-300 transition"
                  autoComplete="username"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-300 transition pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errorMsg && (
                <p className="text-red-600 text-sm font-semibold text-center">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition disabled:bg-red-400"
              >
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </>
  );
}
