import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'

import type { Pengajuan } from '@/types'

interface PengajuanContextType {
  pengajuan: Pengajuan | null
  setPengajuan: (
    pengajuan: Pengajuan | null
  ) => void
}

const PengajuanContext =
  createContext<
    PengajuanContextType | undefined
  >(undefined)

/*
 * PENTING:
 *
 * Jangan gunakan "spk_pengajuan".
 * Key tersebut digunakan mockData.ts
 * sebagai ARRAY.
 *
 * Context menggunakan key berbeda
 * supaya tidak saling merusak.
 */
const STORAGE_KEY =
  'spk_current_pengajuan'

export function PengajuanProvider({
  children,
}: {
  children: ReactNode
}) {
  const [
    pengajuan,
    setPengajuanState,
  ] = useState<Pengajuan | null>(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        )

      if (!saved) {
        return null
      }

      const parsed =
        JSON.parse(saved)

      /*
       * Pastikan data yang dibaca benar-benar
       * sebuah object pengajuan.
       *
       * Kalau ternyata array / data rusak,
       * jangan dipakai.
       */
      if (
        !parsed ||
        Array.isArray(parsed) ||
        typeof parsed !== 'object'
      ) {
        localStorage.removeItem(
          STORAGE_KEY
        )

        return null
      }

      return parsed as Pengajuan
    } catch (error) {
      console.error(
        'Gagal membaca pengajuan dari localStorage:',
        error
      )

      localStorage.removeItem(
        STORAGE_KEY
      )

      return null
    }
  })

  const setPengajuan = (
    value: Pengajuan | null
  ) => {
    setPengajuanState(value)

    if (value) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(value)
      )
    } else {
      localStorage.removeItem(
        STORAGE_KEY
      )
    }
  }

  return (
    <PengajuanContext.Provider
      value={{
        pengajuan,
        setPengajuan,
      }}
    >
      {children}
    </PengajuanContext.Provider>
  )
}

export function usePengajuan() {
  const context =
    useContext(PengajuanContext)

  if (!context) {
    throw new Error(
      'usePengajuan must be used within PengajuanProvider'
    )
  }

  return context
}