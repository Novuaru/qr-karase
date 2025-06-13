import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";  // import Footer

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PT Karase - QR Code Menu",
  description: "Sistem menu digital dengan QR Code untuk PT Karase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen flex flex-col bg-white`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />  {/* Tambahkan footer di sini */}
      </body>
    </html>
    
  );
  
}


