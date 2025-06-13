 "use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KasirPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/kasir/login");
  }, [router]);

  return null;
} 