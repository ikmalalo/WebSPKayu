import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  FormField,
  FormSection,
} from '@/components/shared/FormField'

import { PageHeader } from '@/components/shared/PageHeader'

import {
  usePengajuan,
} from '@/context/PengajuanContext'

import {
  useAuth,
} from '@/context/AuthContext'

import axios from 'axios'

import type {
  Pengajuan,
} from '@/types'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'

/*
 * ============================================================
 * FORM DATA PRIBADI
 *
 * Data ekonomi dan kondisi rumah TIDAK ada di halaman ini.
 * Data tersebut diisi melalui KUESIONER.
 * ============================================================
 */

interface PersonalFormData {
  nik: string
  namaLengkap: string
  tempatLahir: string
  tanggalLahir: string
  jenisKelamin: string
  statusPernikahan: string
  noHp: string
  alamat: string
  kelurahan: string
  kecamatan: string
  kota: string
  provinsi: string
}

const emptyForm: PersonalFormData = {
  nik: '',
  namaLengkap: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: '',
  statusPernikahan: '',
  noHp: '',
  alamat: '',
  kelurahan: '',
  kecamatan: '',
  kota: '',
  provinsi: '',
}

/*
 * ============================================================
 * HELPER FORMAT TANGGAL
 * ============================================================
 */

function formatDateInput(
  value: unknown
): string {
  if (
    !value
  ) {
    return ''
  }

  const date =
    new Date(
      String(value)
    )

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ''
  }

  return date
    .toISOString()
    .split('T')[0]
}

/*
 * ============================================================
 * ADAPT PENGAJUAN BACKEND -> FRONTEND
 * ============================================================
 */

function adaptPengajuan(
  p: any
): Pengajuan {
  return {
    id: p.id,

    userId:
      p.userId,

    mustahikId:
      p.mustahikId,

    namaLengkap:
      p.mustahik?.namaLengkap ||
      '',

    nik:
      p.mustahik?.nik ||
      '',

    status:
      p.status,

    tanggalPengajuan:
      p.createdAt
        ? formatDateInput(
            p.createdAt
          )
        : formatDateInput(
            p.tanggalPengajuan
          ),

    tanggalVerifikasi:
      p.verifications?.[0]
        ?.createdAt
        ? formatDateInput(
            p.verifications[0]
              .createdAt
          )
        : p.tanggalVerifikasi
          ? formatDateInput(
              p.tanggalVerifikasi
            )
          : undefined,

    catatan:
      p.verifications?.[0]
        ?.catatan ||
      p.catatan ||
      undefined,
  }
}

/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export function FormDataMustahikPage() {
  const navigate =
    useNavigate()

  const {
    pengajuan,
    setPengajuan,
  } = usePengajuan()

  const {
    token,
    currentUser,
  } = useAuth()

  const [
    form,
    setForm,
  ] =
    useState<PersonalFormData>(
      emptyForm
    )

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    initialLoading,
    setInitialLoading,
  ] =
    useState(true)

  const [
    isEditMode,
    setIsEditMode,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    )

  /*
   * ==========================================================
   * AUTH HEADERS
   * ==========================================================
   */

  const authHeaders = {
    Authorization:
      `Bearer ${token}`,
  }

  /*
   * ==========================================================
   * LOAD DATA
   * ==========================================================
   */

  useEffect(() => {
    let mounted = true

    const loadData =
      async () => {
        if (
          !token
        ) {
          if (mounted) {
            setInitialLoading(
              false
            )
          }

          return
        }

        try {
          setError(null)

          /*
           * ==================================================
           * 1. AMBIL PROFILE USER
           * ==================================================
           *
           * Endpoint ini mengembalikan:
           *
           * user.name
           * user.email
           * user.phone
           * user.mustahik
           *
           * Nama dan nomor HP dari REGISTER
           * menjadi sumber utama.
           */

          const profileRes =
            await axios.get(
              `${API_URL}/user/profile`,
              {
                headers:
                  authHeaders,
              }
            )

          const user =
            profileRes.data
              ?.data
              ?.user

          /*
           * ==================================================
           * 2. DATA MUSTAHIK
           * ==================================================
           */

          const mustahik =
            user?.mustahik

          /*
           * ==================================================
           * 3. ISI FORM
           * ==================================================
           *
           * PRIORITAS:
           *
           * Nama:
           * User.name
           *   ↓
           * Mustahik.namaLengkap
           *
           * HP:
           * User.phone
           *   ↓
           * Mustahik.noHp
           *
           * Jadi ketika user baru register,
           * nama dan HP langsung muncul.
           */

          if (
            mounted
          ) {
            setForm({
              nik:
                mustahik?.nik ||
                '',

              namaLengkap:
                user?.name ||
                mustahik?.namaLengkap ||
                '',

              tempatLahir:
                mustahik?.tempatLahir ||
                '',

              tanggalLahir:
                formatDateInput(
                  mustahik?.tanggalLahir
                ),

              jenisKelamin:
                mustahik?.jenisKelamin ||
                '',

              statusPernikahan:
                mustahik?.statusPernikahan ||
                '',

              noHp:
                user?.phone ||
                mustahik?.noHp ||
                '',

              alamat:
                mustahik?.alamat ||
                '',

              kelurahan:
                mustahik?.kelurahan ||
                '',

              kecamatan:
                mustahik?.kecamatan ||
                '',

              kota:
                mustahik?.kota ||
                '',

              provinsi:
                mustahik?.provinsi ||
                '',
            })
          }

          /*
           * ==================================================
           * 4. CEK PENGAJUAN YANG SUDAH ADA
           * ==================================================
           */

          const pengajuanRes =
            await axios.get(
              `${API_URL}/pengajuan/me`,
              {
                headers:
                  authHeaders,
              }
            )

          const list: any[] =
            pengajuanRes.data
              ?.data
              ?.pengajuan ||
            []

          if (
            list.length >
            0
          ) {
            const latest =
              [...list].sort(
                (
                  a,
                  b
                ) =>
                  new Date(
                    b.createdAt ||
                      b.tanggalPengajuan ||
                      0
                  ).getTime() -
                  new Date(
                    a.createdAt ||
                      a.tanggalPengajuan ||
                      0
                  ).getTime()
              )[0]

            const adapted =
              adaptPengajuan(
                latest
              )

            if (
              mounted
            ) {
              setIsEditMode(
                true
              )

              setPengajuan(
                adapted
              )

              /*
               * Jika data Mustahik sudah ada,
               * tetap sinkronkan nama dan HP
               * dengan data akun User.
               */
              setForm(
                (
                  previous
                ) => ({
                  ...previous,

                  namaLengkap:
                    user?.name ||
                    latest.mustahik
                      ?.namaLengkap ||
                    previous.namaLengkap,

                  noHp:
                    user?.phone ||
                    latest.mustahik
                      ?.noHp ||
                    previous.noHp,

                  nik:
                    latest.mustahik
                      ?.nik ||
                    previous.nik,

                  tempatLahir:
                    latest.mustahik
                      ?.tempatLahir ||
                    previous.tempatLahir,

                  tanggalLahir:
                    formatDateInput(
                      latest.mustahik
                        ?.tanggalLahir
                    ) ||
                    previous.tanggalLahir,

                  jenisKelamin:
                    latest.mustahik
                      ?.jenisKelamin ||
                    previous.jenisKelamin,

                  statusPernikahan:
                    latest.mustahik
                      ?.statusPernikahan ||
                    previous.statusPernikahan,

                  alamat:
                    latest.mustahik
                      ?.alamat ||
                    previous.alamat,

                  kelurahan:
                    latest.mustahik
                      ?.kelurahan ||
                    previous.kelurahan,

                  kecamatan:
                    latest.mustahik
                      ?.kecamatan ||
                    previous.kecamatan,

                  kota:
                    latest.mustahik
                      ?.kota ||
                    previous.kota,

                  provinsi:
                    latest.mustahik
                      ?.provinsi ||
                    previous.provinsi,
                })
              )
            }
          }
        } catch (
          requestError: any
        ) {
          console.error(
            'GAGAL MEMUAT DATA PENGAJUAN:',
            requestError
          )

          if (
            mounted
          ) {
            setError(
              requestError
                .response
                ?.data
                ?.message ||
                'Gagal memuat data pengguna.'
            )
          }
        } finally {
          if (
            mounted
          ) {
            setInitialLoading(
              false
            )
          }
        }
      }

    loadData()

    return () => {
      mounted = false
    }
  }, [token])

  /*
   * ==========================================================
   * SET FIELD
   * ==========================================================
   */

  const set = (
    field: keyof PersonalFormData,
    value: string
  ) => {
    setForm(
      (
        previous
      ) => ({
        ...previous,
        [field]:
          value,
      })
    )
  }

  /*
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */

  const handleSubmit =
    async () => {
      /*
       * Validasi NIK.
       */

      if (
        !form.nik ||
        form.nik.length !==
          16
      ) {
        setError(
          'NIK harus terdiri dari 16 digit.'
        )

        return
      }

      /*
       * Nama harus berasal dari akun.
       */

      if (
        !form.namaLengkap
      ) {
        setError(
          'Nama lengkap dari akun belum tersedia.'
        )

        return
      }

      /*
       * Nomor HP juga harus tersedia.
       */

      if (
        !form.noHp
      ) {
        setError(
          'Nomor HP dari akun belum tersedia.'
        )

        return
      }

      setLoading(
        true
      )

      setError(null)

      try {
        /*
         * ==================================================
         * PAYLOAD
         * ==================================================
         *
         * Data ekonomi TIDAK dikirim.
         *
         * Penghasilan
         * Jumlah tanggungan
         * Kondisi rumah
         * Pekerjaan
         * Kepemilikan aset
         *
         * semuanya melalui KUESIONER.
         */

        const payload = {
          nik:
            form.nik,

          /*
           * Nama diambil dari currentUser
           * jika tersedia.
           */
          namaLengkap:
            currentUser?.name ||
            form.namaLengkap,

          tempatLahir:
            form.tempatLahir,

          tanggalLahir:
            form.tanggalLahir,

          jenisKelamin:
            form.jenisKelamin,

          statusPernikahan:
            form.statusPernikahan,

          /*
           * HP diambil dari currentUser
           * jika tersedia.
           */
          noHp:
            currentUser?.phone ||
            form.noHp,

          alamat:
            form.alamat,

          kelurahan:
            form.kelurahan,

          kecamatan:
            form.kecamatan,

          kota:
            form.kota,

          provinsi:
            form.provinsi,
        }

        /*
         * ==================================================
         * UPDATE DATA MUSTAHIK
         * ==================================================
         */

        if (
          isEditMode &&
          pengajuan
        ) {
          await axios.patch(
            `${API_URL}/pengajuan/mustahik`,
            payload,
            {
              headers:
                authHeaders,
            }
          )

          navigate(
            '/kuesioner'
          )

          return
        }

        /*
         * ==================================================
         * CREATE PENGAJUAN
         * ==================================================
         */

        const response =
          await axios.post(
            `${API_URL}/pengajuan`,
            payload,
            {
              headers:
                authHeaders,
            }
          )

        const created =
          response.data
            ?.data
            ?.pengajuan

        if (
          created
        ) {
          setPengajuan(
            adaptPengajuan(
              created
            )
          )
        }

        /*
         * Setelah data pribadi berhasil,
         * lanjut ke kuesioner.
         */

        navigate(
          '/kuesioner'
        )
      } catch (
        requestError: any
      ) {
        console.error(
          'GAGAL MENYIMPAN DATA MUSTAHIK:',
          requestError
        )

        if (
          requestError
            .response
            ?.status ===
          409
        ) {
          setError(
            requestError
              .response
              ?.data
              ?.message ||
              'Anda sudah memiliki pengajuan.'
          )

          return
        }

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            'Gagal menyimpan data. Silakan coba lagi.'
        )
      } finally {
        setLoading(
          false
        )
      }
    }

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (
    initialLoading
  ) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />

        <span className="ml-2 text-sm text-slate-500">
          Memuat data...
        </span>
      </div>
    )
  }

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isEditMode
            ? 'Edit Data Mustahik'
            : 'Data Pribadi Mustahik'
        }
        description="Lengkapi data pribadi Anda. Data ekonomi dan kondisi tempat tinggal akan diisi melalui kuesioner."
      />

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />

          <p className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* ======================================================
          DATA PRIBADI
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Data Pribadi
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* ==================================================
              IDENTITAS
          ================================================== */}

          <FormSection title="Identitas Diri">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* NIK */}

              <FormField
                label="NIK"
                htmlFor="nik"
                required
                hint="16 digit nomor KTP"
              >
                <Input
                  id="nik"
                  placeholder="3201xxxxxxxxxxxx"
                  maxLength={16}
                  value={
                    form.nik
                  }
                  onChange={(
                    event
                  ) =>
                    set(
                      'nik',
                      event.target.value.replace(
                        /\D/g,
                        ''
                      )
                    )
                  }
                />
              </FormField>

              {/* NAMA */}

              <FormField
                label="Nama Lengkap"
                htmlFor="nama"
                required
                hint="Otomatis dari nama saat registrasi"
              >
                <Input
                  id="nama"
                  placeholder="Nama lengkap"
                  value={
                    form.namaLengkap
                  }
                  readOnly
                  className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                />
              </FormField>

              {/* TEMPAT LAHIR */}

              <FormField
                label="Tempat Lahir"
                htmlFor="tempat-lahir"
                required
              >
                <Input
                  id="tempat-lahir"
                  placeholder="Kota lahir"
                  value={
                    form.tempatLahir
                  }
                  onChange={(
                    event
                  ) =>
                    set(
                      'tempatLahir',
                      event.target.value
                    )
                  }
                />
              </FormField>

              {/* TANGGAL LAHIR */}

              <FormField
                label="Tanggal Lahir"
                htmlFor="tgl-lahir"
                required
              >
                <Input
                  id="tgl-lahir"
                  type="date"
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  value={
                    form.tanggalLahir
                  }
                  onChange={(
                    event
                  ) =>
                    set(
                      'tanggalLahir',
                      event.target.value
                    )
                  }
                />
              </FormField>

              {/* JENIS KELAMIN */}

              <FormField
                label="Jenis Kelamin"
                htmlFor="jk"
                required
              >
                <Select
                  value={
                    form.jenisKelamin
                  }
                  onValueChange={(
                    value
                  ) =>
                    set(
                      'jenisKelamin',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="jk"
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800"
                  >
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="L">
                      Laki-laki
                    </SelectItem>

                    <SelectItem value="P">
                      Perempuan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              {/* STATUS PERNIKAHAN */}

              <FormField
                label="Status Pernikahan"
                htmlFor="status-nikah"
                required
              >
                <Select
                  value={
                    form.statusPernikahan
                  }
                  onValueChange={(
                    value
                  ) =>
                    set(
                      'statusPernikahan',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="status-nikah"
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800"
                  >
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="belum_menikah">
                      Belum Menikah
                    </SelectItem>

                    <SelectItem value="menikah">
                      Menikah
                    </SelectItem>

                    <SelectItem value="cerai_hidup">
                      Cerai Hidup
                    </SelectItem>

                    <SelectItem value="cerai_mati">
                      Cerai Mati
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              {/* NOMOR HP */}

              <FormField
                label="Nomor HP"
                htmlFor="no-hp"
                required
                hint="Otomatis dari nomor HP saat registrasi"
              >
                <Input
                  id="no-hp"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={
                    form.noHp
                  }
                  readOnly
                  className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                />
              </FormField>

            </div>
          </FormSection>

          {/* ==================================================
              ALAMAT
          ================================================== */}

          <FormSection title="Alamat">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <FormField
                label="Alamat Lengkap"
                htmlFor="alamat"
                required
                className="sm:col-span-2"
              >
                <Input
                  id="alamat"
                  placeholder="Jalan, nomor, RT/RW"
                  value={
                    form.alamat
                  }
                  onChange={(
                    event
                  ) =>
                    set(
                      'alamat',
                      event.target.value
                    )
                  }
                />
              </FormField>

              <FormField
                label="Kelurahan"
                htmlFor="kelurahan"
                required
              >
                <Input
                  id="kelurahan"
                  placeholder="Kelurahan"
                  value={
                    form.kelurahan
                  }
                  onChange={(
                    event
                  ) =>
                    set(
                      'kelurahan',
                      event.target.value
                    )
                  }
                />
              </FormField>

              <FormField
                label="Kecamatan"
                htmlFor="kecamatan"
                required
              >
                <Input
                  id="kecamatan"
                  placeholder="Kecamatan"
                  value={
                    form.kecamatan
                  }
                  onChange={(
                    event
                  ) =>
                    set(
                      'kecamatan',
                      event.target.value
                    )
                  }
                />
              </FormField>

              <FormField
                label="Kota/Kabupaten"
                htmlFor="kota"
                required
              >
                <Input
                  id="kota"
                  placeholder="Kota / Kabupaten"
                  value={
                    form.kota
                  }
                  onChange={(
                    event
                  ) =>
                    set(
                      'kota',
                      event.target.value
                    )
                  }
                />
              </FormField>

              <FormField
                label="Provinsi"
                htmlFor="provinsi"
                required
              >
                <Input
                  id="provinsi"
                  placeholder="Provinsi"
                  value={
                    form.provinsi
                  }
                  onChange={(
                    event
                  ) =>
                    set(
                      'provinsi',
                      event.target.value
                    )
                  }
                />
              </FormField>

            </div>
          </FormSection>

          {/* ==================================================
              INFO
          ================================================== */}

          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              Selanjutnya: Kuesioner
            </p>

            <p className="text-xs text-green-700 dark:text-green-400 mt-1">
              Setelah data pribadi disimpan,
              Anda akan mengisi kuesioner
              mengenai penghasilan,
              tanggungan keluarga, kondisi
              rumah, pekerjaan, dan
              kepemilikan aset. Jawaban
              tersebut akan digunakan sebagai
              dasar perhitungan SPK TOPSIS.
            </p>
          </div>

        </CardContent>
      </Card>

      {/* ======================================================
          BUTTON
      ====================================================== */}

      <div className="flex justify-end">
        <Button
          onClick={
            handleSubmit
          }
          disabled={
            loading ||
            !form.namaLengkap ||
            !form.noHp
          }
          className="min-w-[180px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Simpan & Isi Kuesioner
            </>
          )}
        </Button>
      </div>
    </div>
  )
}