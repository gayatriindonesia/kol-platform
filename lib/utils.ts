import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Menghasilkan string acak untuk digunakan dalam OAuth (PKCE)
 * @param length Panjang string yang diinginkan
 */
export function generateRandomString(length: number): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const buffer = crypto.randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    result += charset[buffer[i] % charset.length];
  }

  return result;
}

/**
 * Menghasilkan SHA-256 hash dari string
 * @param input String yang akan di-hash
 */
export function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Helper untuk memeriksa apakah token OAuth akan kedaluwarsa segera
 * @param expiresAt Tanggal kedaluwarsa token
 * @param thresholdMinutes Menit sebelum kedaluwarsa dianggap akan segera terjadi (default: 60)
 */
export function tokenWillExpireSoon(expiresAt: Date | null, thresholdMinutes = 60): boolean {
  if (!expiresAt) return true;
  
  const now = new Date();
  const threshold = new Date(now.getTime() + thresholdMinutes * 60 * 1000);
  
  return expiresAt < threshold;
}

/**
 * Memformat angka followers untuk tampilan
 * Contoh: 1500 -> 1.5K, 1000000 -> 1M
 */
export function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

/**
 * Memformat engagement rate untuk tampilan
 * @param rate Engagement rate (0.05 = 5%)
 */
export function formatEngagementRate(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) return 'N/A';
  return (rate * 100).toFixed(2) + '%';
}

export function generateId(): string {
  return crypto.randomUUID()
}
