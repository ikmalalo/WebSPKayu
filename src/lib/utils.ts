import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { StatusPengajuan } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Mengubah value menjadi Date yang valid.
 * Kalau value kosong / invalid, return null.
 */
function parseValidDate(
  value: string | Date | null | undefined
): Date | null {
  if (!value) {
    return null
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

export function formatDate(
  dateStr: string | Date | null | undefined
): string {
  const date = parseValidDate(dateStr)

  if (!date) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatDateShort(
  dateStr: string | Date | null | undefined
): string {
  const date = parseValidDate(dateStr)

  if (!date) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function getStatusLabel(status: StatusPengajuan): string {
  const labels: Record<StatusPengajuan, string> = {
    DRAFT: 'Draft',
    MENUNGGU_VERIFIKASI: 'Menunggu Verifikasi',
    SEDANG_DIVERIFIKASI: 'Sedang Diverifikasi',
    PERLU_PERBAIKAN: 'Perlu Perbaikan',
    LOLOS_VERIFIKASI: 'Lolos Verifikasi',
    DITOLAK: 'Ditolak',
    DIPROSES_TOPSIS: 'Diproses TOPSIS',
    LAYAK_DIDANAI: 'Layak Didanai',
    TIDAK_DIDANAI: 'Tidak Didanai',
  }

  return labels[status] || status
}

export type StatusColor =
  | 'gray'
  | 'yellow'
  | 'blue'
  | 'orange'
  | 'green'
  | 'red'
  | 'purple'
  | 'emerald'
  | 'rose'

export function getStatusColor(
  status: StatusPengajuan
): StatusColor {
  const colors: Record<
    StatusPengajuan,
    StatusColor
  > = {
    DRAFT: 'gray',
    MENUNGGU_VERIFIKASI: 'yellow',
    SEDANG_DIVERIFIKASI: 'blue',
    PERLU_PERBAIKAN: 'orange',
    LOLOS_VERIFIKASI: 'green',
    DITOLAK: 'red',
    DIPROSES_TOPSIS: 'purple',
    LAYAK_DIDANAI: 'emerald',
    TIDAK_DIDANAI: 'rose',
  }

  return colors[status] || 'gray'
}

export function getProgressSteps(
  status: StatusPengajuan
): number {
  const steps: Record<
    StatusPengajuan,
    number
  > = {
    DRAFT: 1,
    MENUNGGU_VERIFIKASI: 2,
    SEDANG_DIVERIFIKASI: 3,
    PERLU_PERBAIKAN: 2,
    LOLOS_VERIFIKASI: 4,
    DITOLAK: 2,
    DIPROSES_TOPSIS: 5,
    LAYAK_DIDANAI: 6,
    TIDAK_DIDANAI: 6,
  }

  return steps[status] || 1
}

export function formatNIK(nik: string): string {
  return nik.replace(
    /(\d{6})(\d{6})(\d{4})/,
    '$1 $2 $3'
  )
}

export function getJenisKelaminLabel(
  jk: 'L' | 'P'
): string {
  return jk === 'L'
    ? 'Laki-laki'
    : 'Perempuan'
}

export function getStatusPernikahanLabel(
  status: string
): string {
  const labels: Record<string, string> = {
    belum_menikah: 'Belum Menikah',
    menikah: 'Menikah',
    cerai_hidup: 'Cerai Hidup',
    cerai_mati: 'Cerai Mati',
  }

  return labels[status] || status
}

export function getKondisiRumahLabel(
  kondisi: string
): string {
  const labels: Record<string, string> = {
    baik: 'Baik',
    sedang: 'Sedang',
    buruk: 'Buruk',
  }

  return labels[kondisi] || kondisi
}

export function getStatusRumahLabel(
  status: string
): string {
  const labels: Record<string, string> = {
    milik_sendiri: 'Milik Sendiri',
    sewa: 'Sewa / Kontrak',
    menumpang: 'Menumpang',
    dinas: 'Rumah Dinas',
  }

  return labels[status] || status
}