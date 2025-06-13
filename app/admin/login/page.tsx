"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Eye, EyeOff } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Komponen Page Loader
const PageLoader = () => (
  <motion.div
    className="fixed inset-0 bg-gradient-to-br from-red-50 to-white flex items-center justify-center z-[100]"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
  </motion.div>
);

export default function AdminLogin() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true); // State untuk page loader
  const [showPassword, setShowPassword] = useState(false);
  const emailInput = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "", // Untuk konfirmasi password
  });

  useEffect(() => {
    // Sembunyikan page loader setelah sedikit delay
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 300); // Durasi loader, bisa disesuaikan
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Fokus ke input email setelah page loader hilang
    if (!pageLoading) emailInput.current?.focus();
  }, [isSignUp, pageLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { email, password, confirmPassword } = formData;

      if (!email.includes("@")) {
        throw new Error("Format email tidak valid");
      }

      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Password dan konfirmasi password tidak sama");
        }

        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existingUser) throw new Error("Email sudah terdaftar");

        const { error: insertError } = await supabase.from("users").insert([
          {
            email,
            password,
            role: "admin",
            name: "Admin",
          },
        ]);

        if (insertError) throw insertError;

        setSuccess("Pendaftaran berhasil! Silakan login.");
        setIsSignUp(false);
        setFormData({ email: "", password: "", confirmPassword: "" });
      } else {
        const { data: user, error: loginError } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .eq("password", password)
          .single();

        if (loginError || !user) throw new Error("Email atau password salah");
        if (user.role !== "admin")
          throw new Error("Anda tidak memiliki akses admin");

        localStorage.setItem("admin_id", user.id);
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
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
          transition={{ duration: 0.5, delay: 0.1 }} // Konten muncul setelah loader
          className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4"
        >
          <div className="w-full max-w-md space-y-6 p-8 bg-white rounded-2xl shadow-xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">
                {isSignUp ? "Daftar Admin Baru" : "Login Admin"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isSignUp
                  ? "Isi form untuk mendaftar sebagai admin"
                  : "Masuk ke dashboard admin PT Karase"}
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded text-sm">
                {success}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 text-sm text-gray-700 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  required
                  ref={emailInput}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="admin@karase.com"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-700 font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none shadow-sm pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-800"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block mb-1 text-sm text-gray-700 font-medium">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none shadow-sm pr-10"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center gap-2 py-2 px-4 text-white rounded-md font-medium transition ${
                  loading
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading && <Loader2 className="animate-spin h-4 w-4" />}
                {loading ? "Memproses..." : isSignUp ? "Daftar" : "Masuk"}
              </button>
            </form>

            <div className="text-center text-sm text-gray-500">
              {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                  setFormData({ ...formData, password: "", confirmPassword: "" });
                }}
                className="text-red-600 hover:underline font-medium"
              >
                {isSignUp ? "Login di sini" : "Daftar di sini"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
