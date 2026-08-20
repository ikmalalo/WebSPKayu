import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import axios from 'axios'

import {
  useAuth,
} from './AuthContext'

import type {
  Pengajuan,
} from '@/types'


// ============================================================
// CONFIG
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'

const REFRESH_INTERVAL =
  5000


// ============================================================
// CONTEXT TYPE
// ============================================================

interface PengajuanContextType {

  pengajuan:
    | Pengajuan
    | null

  setPengajuan:
    React.Dispatch<
      React.SetStateAction<
        Pengajuan | null
      >
    >

  loading:
    boolean

  refreshPengajuan:
    () => Promise<void>
}


// ============================================================
// CONTEXT
// ============================================================

const PengajuanContext =
  createContext<
    PengajuanContextType |
    undefined
  >(undefined)


// ============================================================
// ADAPTER
// ============================================================

function adaptPengajuan(
  data: any
): Pengajuan {

  const verifications =
    Array.isArray(
      data?.verifications
    )
      ? data.verifications
      : []


  // ----------------------------------------------------------
  // Cari verifikasi PALING BARU.
  //
  // Jangan langsung menggunakan [0], karena urutan response
  // dari backend belum tentu selalu sama.
  // ----------------------------------------------------------

  const latestVerification =
    [...verifications]
      .sort(
        (
          a: any,
          b: any
        ) => {

          const dateA =
            new Date(
              a?.createdAt || 0
            ).getTime()

          const dateB =
            new Date(
              b?.createdAt || 0
            ).getTime()

          return (
            dateB -
            dateA
          )
        }
      )[0]


  // ----------------------------------------------------------
  // Tanggal pengajuan
  // ----------------------------------------------------------

  const tanggalPengajuan =
    data?.tanggalPengajuan ||
    data?.createdAt ||
    ''


  // ----------------------------------------------------------
  // Tanggal verifikasi
  // ----------------------------------------------------------

  const tanggalVerifikasi =
    data?.tanggalVerifikasi ||
    latestVerification?.createdAt ||
    undefined


  // ----------------------------------------------------------
  // CATATAN ADMIN
  //
  // Prioritas:
  // 1. catatan dari Pengajuan
  // 2. catatan verifikasi terbaru
  //
  // Ini penting supaya ketika admin mengubah catatan,
  // catatan terbaru yang ditampilkan user ikut berubah.
  // ----------------------------------------------------------

  const catatan =
    data?.catatan ??
    latestVerification?.catatan ??
    undefined


  return {

    id:
      data?.id || '',

    userId:
      data?.userId || '',

    mustahikId:
      data?.mustahikId || '',

    namaLengkap:
      data?.mustahik
        ?.namaLengkap ||
      data?.namaLengkap ||
      '',

    nik:
      data?.mustahik
        ?.nik ||
      data?.nik ||
      '',

    status:
      data?.status,

    tanggalPengajuan:
      tanggalPengajuan
        ? new Date(
            tanggalPengajuan
          )
            .toISOString()
            .split('T')[0]
        : '',

    tanggalVerifikasi:
      tanggalVerifikasi
        ? new Date(
            tanggalVerifikasi
          )
            .toISOString()
            .split('T')[0]
        : undefined,

    catatan:
      catatan ||
      undefined,
  }
}


// ============================================================
// GET PENGAJUAN USER
// ============================================================

async function fetchMyPengajuan(
  token: string
): Promise<Pengajuan | null> {

  const response =
    await axios.get(
      `${API_URL}/pengajuan/me`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )


  const list =
    response
      ?.data
      ?.data
      ?.pengajuan


  // ----------------------------------------------------------
  // Pastikan response berupa array
  // ----------------------------------------------------------

  if (
    !Array.isArray(list) ||
    list.length === 0
  ) {
    return null
  }


  // ----------------------------------------------------------
  // Ambil pengajuan terbaru.
  //
  // Ini lebih aman daripada selalu mengambil list[0].
  // ----------------------------------------------------------

  const sorted =
    [...list].sort(
      (
        a: any,
        b: any
      ) => {

        const dateA =
          new Date(
            a?.createdAt ||
            a?.tanggalPengajuan ||
            0
          ).getTime()

        const dateB =
          new Date(
            b?.createdAt ||
            b?.tanggalPengajuan ||
            0
          ).getTime()

        return (
          dateB -
          dateA
        )
      }
    )


  return adaptPengajuan(
    sorted[0]
  )
}


// ============================================================
// PROVIDER
// ============================================================

export function PengajuanProvider({
  children,
}: {
  children: ReactNode
}) {

  const {
    token,
  } = useAuth()


  const [
    pengajuan,
    setPengajuan,
  ] =
    useState<
      Pengajuan | null
    >(null)


  const [
    loading,
    setLoading,
  ] =
    useState(true)


  // ==========================================================
  // REFRESH PENGAJUAN
  // ==========================================================

  const refreshPengajuan =
    useCallback(
      async () => {

        // ----------------------------------------------------
        // Belum login
        // ----------------------------------------------------

        if (!token) {

          setPengajuan(null)
          setLoading(false)

          return
        }


        try {

          const latest =
            await fetchMyPengajuan(
              token
            )


          // --------------------------------------------------
          // Update state hanya jika memang berubah.
          //
          // Ini menghindari render berlebihan setiap polling.
          // --------------------------------------------------

          setPengajuan(
            (
              previous
            ) => {

              if (
                !previous &&
                !latest
              ) {
                return null
              }


              if (
                !previous &&
                latest
              ) {
                return latest
              }


              if (
                previous &&
                !latest
              ) {
                return null
              }


              if (
                previous &&
                latest
              ) {

                const same =
                  previous.id ===
                    latest.id &&

                  previous.status ===
                    latest.status &&

                  previous.catatan ===
                    latest.catatan &&

                  previous.tanggalVerifikasi ===
                    latest.tanggalVerifikasi &&

                  previous.tanggalPengajuan ===
                    latest.tanggalPengajuan &&

                  previous.namaLengkap ===
                    latest.namaLengkap &&

                  previous.nik ===
                    latest.nik


                if (same) {
                  return previous
                }


                return latest
              }


              return latest
            }
          )

        } catch (
          error: any
        ) {

          // --------------------------------------------------
          // Jangan menghapus data lama hanya karena polling
          // gagal.
          //
          // Misalnya backend restart sebentar, user tetap
          // melihat data terakhir yang valid.
          // --------------------------------------------------

          console.error(
            'REFRESH PENGAJUAN ERROR:',
            error?.response
              ?.data ||
              error?.message ||
              error
          )

        } finally {

          setLoading(false)

        }

      },
      [
        token,
      ]
    )


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    if (!token) {

      setPengajuan(null)
      setLoading(false)

      return
    }


    setLoading(true)

    refreshPengajuan()

  }, [
    token,
    refreshPengajuan,
  ])


  // ==========================================================
  // AUTO REFRESH
  //
  // Setiap 5 detik.
  // ==========================================================

  useEffect(() => {

    if (!token) {
      return
    }


    const interval =
      window.setInterval(
        () => {

          // --------------------------------------------------
          // Kalau tab sedang tidak aktif, jangan request.
          // --------------------------------------------------

          if (
            document.visibilityState !==
            'visible'
          ) {
            return
          }


          refreshPengajuan()

        },
        REFRESH_INTERVAL
      )


    return () => {

      window.clearInterval(
        interval
      )

    }

  }, [
    token,
    refreshPengajuan,
  ])


  // ==========================================================
  // REFRESH KETIKA USER KEMBALI KE TAB
  // ==========================================================

  useEffect(() => {

    if (!token) {
      return
    }


    const handleFocus =
      () => {

        refreshPengajuan()

      }


    const handleVisibility =
      () => {

        if (
          document.visibilityState ===
          'visible'
        ) {

          refreshPengajuan()

        }

      }


    window.addEventListener(
      'focus',
      handleFocus
    )


    document.addEventListener(
      'visibilitychange',
      handleVisibility
    )


    return () => {

      window.removeEventListener(
        'focus',
        handleFocus
      )


      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      )

    }

  }, [
    token,
    refreshPengajuan,
  ])


  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value =
    useMemo(
      () => ({
        pengajuan,
        setPengajuan,
        loading,
        refreshPengajuan,
      }),
      [
        pengajuan,
        loading,
        refreshPengajuan,
      ]
    )


  return (
    <PengajuanContext.Provider
      value={value}
    >
      {children}
    </PengajuanContext.Provider>
  )
}


// ============================================================
// HOOK
// ============================================================

export function usePengajuan() {

  const context =
    useContext(
      PengajuanContext
    )


  if (!context) {

    throw new Error(
      'usePengajuan harus digunakan di dalam PengajuanProvider'
    )

  }


  return context
}