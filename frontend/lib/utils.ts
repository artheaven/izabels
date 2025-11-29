import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const EUR_TO_BGN_RATE = 1.95583;

export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return '0.00 лв';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '0.00 лв';
  return `${num.toFixed(2)} лв`;
}

export function convertBGNToEUR(bgn: number | string): number {
  const num = typeof bgn === 'string' ? parseFloat(bgn) : bgn;
  return num / EUR_TO_BGN_RATE;
}

export function formatPriceEUR(bgn: number | string): string {
  const eur = convertBGNToEUR(bgn);
  return `${eur.toFixed(2)} €`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('bg-BG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

