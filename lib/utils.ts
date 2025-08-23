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

// format currency to IDR
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// format date to Indonesian locale
export function formatDate(dateStr: string | Date): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Campaign Metrics
export interface MetricThreshold {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

export interface MetricConfig {
  name: string;
  description: string;
  thresholds: MetricThreshold;
  format: 'percentage' | 'number' | 'decimal';
}

// Konfigurasi untuk setiap metric
export const METRICS_CONFIG: Record<string, MetricConfig> = {
  reachRate: {
    name: 'Reach Rate',
    description: 'Persentase orang yang melihat konten dari total impressions',
    thresholds: { excellent: 80, good: 60, fair: 40, poor: 0 },
    format: 'percentage'
  },
  engagementRate: {
    name: 'Engagement Rate', 
    description: 'Persentase interaksi (like, comment, share) dari total reach',
    thresholds: { excellent: 6, good: 3, fair: 1, poor: 0 },
    format: 'percentage'
  },
  responseRate: {
    name: 'Response Rate',
    description: 'Persentase influencer yang merespons invitation campaign',
    thresholds: { excellent: 90, good: 75, fair: 60, poor: 0 },
    format: 'percentage'
  },
  completionRate: {
    name: 'Completion Rate',
    description: 'Persentase deliverables yang berhasil diselesaikan',
    thresholds: { excellent: 95, good: 85, fair: 70, poor: 0 },
    format: 'percentage'
  },
  onTimeDeliveryRate: {
    name: 'On-Time Delivery Rate',
    description: 'Persentase deliverables yang diselesaikan tepat waktu',
    thresholds: { excellent: 95, good: 80, fair: 65, poor: 0 },
    format: 'percentage'
  }
};

// Fungsi untuk mendapatkan grade berdasarkan nilai
export function getMetricGrade(value: number, metricKey: string): {
  grade: 'excellent' | 'good' | 'fair' | 'poor';
  label: string;
  color: string;
} {
  const config = METRICS_CONFIG[metricKey];
  if (!config) {
    return { grade: 'fair', label: 'Unknown', color: 'gray' };
  }

  const { thresholds } = config;

  if (value >= thresholds.excellent) {
    return { grade: 'excellent', label: 'Excellent', color: 'green' };
  } else if (value >= thresholds.good) {
    return { grade: 'good', label: 'Good', color: 'blue' };
  } else if (value >= thresholds.fair) {
    return { grade: 'fair', label: 'Fair', color: 'yellow' };
  } else {
    return { grade: 'poor', label: 'Poor', color: 'red' };
  }
}

// Fungsi untuk mendapatkan warna berdasarkan grade
export function getColorClasses(color: string): {
  bg: string;
  text: string;
  border: string;
  gradient: string;
} {
  switch (color) {
    case 'green':
      return {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        gradient: 'from-green-500 to-emerald-600'
      };
    case 'blue':
      return {
        bg: 'bg-blue-50', 
        text: 'text-blue-600',
        border: 'border-blue-200',
        gradient: 'from-blue-500 to-cyan-600'
      };
    case 'yellow':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600', 
        border: 'border-yellow-200',
        gradient: 'from-yellow-500 to-orange-600'
      };
    case 'red':
      return {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
        gradient: 'from-red-500 to-pink-600'
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200', 
        gradient: 'from-gray-500 to-slate-600'
      };
  }
}

// Fungsi untuk format angka
export function formatMetricValue(value: number, format: 'percentage' | 'number' | 'decimal'): string {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
      return value.toLocaleString();
    case 'decimal':
      return value.toFixed(2);
    default:
      return value.toString();
  }
}

// Fungsi untuk format angka besar (1K, 1M, dll)
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

// Fungsi untuk mendapatkan insight berdasarkan metrics
export function getMetricInsights(metrics: Record<string, { value: number }>): string[] {
  const insights: string[] = [];

  // Response Rate insights
  if (metrics.responseRate?.value < 50) {
    insights.push('💡 Response rate rendah - pertimbangkan untuk meningkatkan kualitas pitch atau targeting influencer');
  } else if (metrics.responseRate?.value > 90) {
    insights.push('🎉 Response rate excellent - strategi targeting sangat efektif');
  }

  // Engagement Rate insights  
  if (metrics.engagementRate?.value < 2) {
    insights.push('📈 Engagement rate di bawah rata-rata - coba analisis konten yang lebih resonan dengan audience');
  } else if (metrics.engagementRate?.value > 5) {
    insights.push('🔥 Engagement rate tinggi - konten sangat resonan dengan audience target');
  }

  // Completion Rate insights
  if (metrics.completionRate?.value < 80) {
    insights.push('⚠️ Completion rate perlu ditingkatkan - review proses onboarding dan komunikasi');
  } else if (metrics.completionRate?.value > 95) {
    insights.push('✅ Completion rate excellent - proses campaign management sangat baik');
  }

  // On-time delivery insights
  if (metrics.onTimeDeliveryRate?.value < 75) {
    insights.push('⏰ Banyak deliverable terlambat - pertimbangkan untuk menyesuaikan timeline atau follow-up');
  } else if (metrics.onTimeDeliveryRate?.value > 90) {
    insights.push('🎯 On-time delivery sangat baik - timeline dan ekspektasi sudah tepat');
  }

  // Reach Rate insights
  if (metrics.reachRate?.value < 50) {
    insights.push('👁️ Reach rate rendah - evaluasi waktu posting dan relevansi konten dengan audience');
  }

  return insights;
}

// Fungsi untuk kalkulasi trend (butuh data historis)
export function calculateTrend(currentValue: number, previousValue: number): {
  percentage: number;
  direction: 'up' | 'down' | 'stable';
  label: string;
} {
  if (previousValue === 0) {
    return { percentage: 0, direction: 'stable', label: 'No previous data' };
  }

  const percentage = ((currentValue - previousValue) / previousValue) * 100;
  
  if (Math.abs(percentage) < 1) {
    return { percentage: 0, direction: 'stable', label: 'Stable' };
  }
  
  return {
    percentage: Math.abs(percentage),
    direction: percentage > 0 ? 'up' : 'down',
    label: `${percentage > 0 ? '+' : '-'}${Math.abs(percentage).toFixed(1)}%`
  };
}

// Fungsi untuk generate rekomendasi
export function generateRecommendations(metrics: Record<string, { value: number }>): Array<{
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  action?: string;
}> {
  const recommendations = [];

  // Analisis Response Rate
  if (metrics.responseRate?.value < 60) {
    recommendations.push({
      type: 'warning' as const,
      title: 'Tingkatkan Response Rate',
      description: 'Response rate campaign masih di bawah standar industri (70%+)',
      action: 'Review kriteria targeting dan personalisasi message invitation'
    });
  }

  // Analisis Engagement Rate
  if (metrics.engagementRate?.value < 3) {
    recommendations.push({
      type: 'warning' as const,
      title: 'Optimasi Engagement',
      description: 'Engagement rate perlu ditingkatkan untuk ROI yang lebih baik',
      action: 'Kolaborasi lebih erat dengan influencer dalam creative brief'
    });
  }

  // Analisis Completion Rate
  if (metrics.completionRate?.value < 85) {
    recommendations.push({
      type: 'warning' as const,
      title: 'Perbaiki Completion Rate', 
      description: 'Banyak deliverable yang tidak diselesaikan sepenuhnya',
      action: 'Review proses onboarding dan komunikasi ekspektasi yang lebih jelas'
    });
  }

  // Success recommendations
  if (metrics.responseRate?.value > 85 && metrics.completionRate?.value > 90) {
    recommendations.push({
      type: 'success' as const,
      title: 'Campaign Management Excellent',
      description: 'Response dan completion rate sangat baik - pertahankan strategi ini',
      action: 'Dokumentasikan best practices untuk campaign selanjutnya'
    });
  }

  // Info recommendations
  recommendations.push({
    type: 'info' as const,
    title: 'Monitor Berkelanjutan',
    description: 'Lakukan evaluasi metrics setiap minggu untuk optimasi real-time',
    action: 'Set up automated reporting dan alert untuk metrics yang turun'
  });

  return recommendations;
}
