"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  async function checkAuth() {
    try {
      const adminId = localStorage.getItem("admin_id");
      
      if (!adminId) {
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      // Check if user exists and has admin role
      const { data: user, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", adminId)
        .single();

      if (error || !user || user.role !== "admin") {
        localStorage.removeItem("admin_id");
        router.push("/admin/login");
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      // If on login page but already authenticated, redirect to dashboard
      if (pathname === "/admin/login") {
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/admin/login");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  // Don't show layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-red-600"></span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  localStorage.removeItem("admin_id");
                  router.push("/admin/login");
                }}
                className="text-red-600 hover:text-red-800 font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
