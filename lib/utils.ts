import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Format angka ke dalam format Rupiah (IDR)
 * @param amount Jumlah uang
 * @returns String dalam format "Rp x.xxx"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal ISO ke format Indonesia
 * @param dateStr Tanggal dalam string
 * @returns Format "DD Month YYYY"
 */
export function formatTanggal(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Utility untuk menggabungkan class Tailwind dengan clsx + twMerge
 * @param inputs Daftar class
 * @returns Class string akhir
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
