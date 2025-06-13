// app/admin/kasir.tsx
"use client";

import { useEffect, useState } from "react";
import { getKasirList } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

type Kasir = {
  id: string;
  name: string;
  email: string;
  restaurant_name: string;
};

export default function KasirPage() {
  const [kasirs, setKasirs] = useState<Kasir[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKasirs() {
      const data = await getKasirList();
      setKasirs(data);
      setLoading(false);
    }
    fetchKasirs();
  }, []);

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Kasir</h1>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          Tambah Kasir
        </Button>
      </div>

      {loading ? (
        <p>Memuat data kasir...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kasirs.map((kasir) => (
            <Card key={kasir.id}>
              <CardContent className="p-4">
                <h2 className="font-semibold text-lg">{kasir.name}</h2>
                <p className="text-sm text-gray-600">{kasir.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Restoran: {kasir.restaurant_name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
