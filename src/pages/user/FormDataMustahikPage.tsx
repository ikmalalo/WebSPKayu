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
 * PENTING:
 * Data ekonomi dan kondisi rumah TIDAK ada lagi di sini.
 *
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
 * Adapt response backend ke tipe frontend.
 */
function adaptPengajuan(
  p: any
): Pengajuan {
  return {
    id: p.id,
    userId: p.userId,
    mustahikId: p.mustahikId,
    namaLengkap:
      p.mustahik?.namaLengkap ||
      '',
    nik:
      p.mustahik?.nik ||
      '',
    status: p.status,
    tanggalPengajuan:
      p.createdAt
        ? new Date(
            p.createdAt
          )
            .toISOString()
            .split('T')[0]
        : new Date()
            .toISOString()
            .split('T')[0],
    tanggalVerifikasi:
      p.verifications?.[0]
        ?.createdAt
        ? new Date(
            p.verifications[0]
              .createdAt
          )
            .toISOString()
            .split('T')[0]
        : undefined,
    catatan:
      p.verifications?.[0]
        ?.catatan ||
      p.catatan ||
      undefined,
  }
}

export function FormDataMustahikPage() {
  const navigate =
    useNavigate()

  const {
    pengajuan,
    setPengajuan,
  } = usePengajuan()

  const {
    token,
  } = useAuth()

  const [form, setForm] =
    useState<PersonalFormData>(
      emptyForm
    )

  const [loading, setLoading] =
    useState(false)

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true)

  const [
    isEditMode,
    setIsEditMode,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  }

  /*
   * ==========================================================
   * LOAD DATA USER
   * ==========================================================
   */

  useEffect(() => {
    const loadData =
      async () => {
        if (!token) {
          setInitialLoading(
            false
          )
          return
        }

        try {
          /*
           * Ambil profil user.
           */
          const profileRes =
            await axios.get(
              `${API_URL}/user/profile`,
              {
                headers:
                  authHeaders,
              }
            )

          const mustahik =
            profileRes.data
              ?.data?.user
              ?.mustahik

          /*
           * Kalau user sudah pernah
           * mengisi data pribadi,
           * tampilkan kembali.
           *
           * Data ekonomi TIDAK diambil
           * ke form ini.
           */
          if (mustahik) {
            setForm({
              nik:
                mustahik.nik ||
                '',
              namaLengkap:
                mustahik.namaLengkap ||
                '',
              tempatLahir:
                mustahik.tempatLahir ||
                '',
              tanggalLahir:
                mustahik.tanggalLahir
                  ? new Date(
                      mustahik.tanggalLahir
                    )
                      .toISOString()
                      .split(
                        'T'
                      )[0]
                  : '',
              jenisKelamin:
                mustahik.jenisKelamin ||
                '',
              statusPernikahan:
                mustahik.statusPernikahan ||
                '',
              noHp:
                mustahik.noHp ||
                '',
              alamat:
                mustahik.alamat ||
                '',
              kelurahan:
                mustahik.kelurahan ||
                '',
              kecamatan:
                mustahik.kecamatan ||
                '',
              kota:
                mustahik.kota ||
                '',
              provinsi:
                mustahik.provinsi ||
                '',
            })
          }

          /*
           * Cek apakah sudah mempunyai pengajuan.
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
              ?.data?.pengajuan ||
            []

          if (
            list.length > 0
          ) {
            setIsEditMode(
              true
            )

            const adapted =
              adaptPengajuan(
                list[0]
              )

            /*
             * Sinkronkan context.
             */
            setPengajuan(
              adapted
            )
          }
        } catch (error) {
          console.error(
            'Gagal memuat data pengajuan:',
            error
          )
        } finally {
          setInitialLoading(
            false
          )
        }
      }

    loadData()
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
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  /*
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */

  const handleSubmit =
    async () => {
      /*
       * Validasi minimal.
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

      if (
        !form.namaLengkap
      ) {
        setError(
          'Nama lengkap wajib diisi.'
        )
        return
      }

      setLoading(true)
      setError(null)

      try {
        /*
         * HANYA kirim data pribadi.
         *
         * Tidak ada:
         * penghasilan
         * jumlahTanggungan
         * pekerjaan
         * statusRumah
         * kondisiRumah
         * kepemilikanAset
         *
         * karena semuanya berasal
         * dari kuesioner.
         */
        const payload = {
          nik:
            form.nik,
          namaLengkap:
            form.namaLengkap,
          tempatLahir:
            form.tempatLahir,
          tanggalLahir:
            form.tanggalLahir,
          jenisKelamin:
            form.jenisKelamin,
          statusPernikahan:
            form.statusPernikahan,
          noHp:
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
         * Kalau sudah mempunyai pengajuan,
         * update data pribadi saja.
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

          /*
           * Langsung ke kuesioner.
           */
          navigate(
            '/kuesioner'
          )

          return
        }

        /*
         * Buat pengajuan baru.
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
            ?.data?.pengajuan

        if (created) {
          setPengajuan(
            adaptPengajuan(
              created
            )
          )
        }

        /*
         * Setelah data pribadi selesai,
         * user wajib mengisi kuesioner.
         */
        navigate(
          '/kuesioner'
        )
      } catch (error: any) {
        console.error(
          'Gagal menyimpan data mustahik:',
          error
        )

        setError(
          error.response
            ?.data?.message ||
            'Gagal menyimpan data. Silakan coba lagi.'
        )
      } finally {
        setLoading(false)
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

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />

          <p className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* DATA PRIBADI */}
      <Card>
        <CardHeader>
          <CardTitle>
            Data Pribadi
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* IDENTITAS */}
          <FormSection title="Identitas Diri">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    e
                  ) =>
                    set(
                      'nik',
                      e.target
                        .value
                        .replace(
                          /\D/g,
                          ''
                        )
                    )
                  }
                />
              </FormField>

              <FormField
                label="Nama Lengkap"
                htmlFor="nama"
                required
              >
                <Input
                  id="nama"
                  placeholder="Sesuai KTP"
                  value={
                    form.namaLengkap
                  }
                  onChange={(
                    e
                  ) =>
                    set(
                      'namaLengkap',
                      e.target
                        .value
                    )
                  }
                />
              </FormField>

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
                    e
                  ) =>
                    set(
                      'tempatLahir',
                      e.target
                        .value
                    )
                  }
                />
              </FormField>

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
                    e
                  ) =>
                    set(
                      'tanggalLahir',
                      e.target
                        .value
                    )
                  }
                />
              </FormField>

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

              <FormField
                label="Nomor HP"
                htmlFor="no-hp"
                required
              >
                <Input
                  id="no-hp"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={
                    form.noHp
                  }
                  onChange={(
                    e
                  ) =>
                    set(
                      'noHp',
                      e.target
                        .value
                    )
                  }
                />
              </FormField>
            </div>
          </FormSection>

          {/* ALAMAT */}
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
                    e
                  ) =>
                    set(
                      'alamat',
                      e.target
                        .value
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
                    e
                  ) =>
                    set(
                      'kelurahan',
                      e.target
                        .value
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
                    e
                  ) =>
                    set(
                      'kecamatan',
                      e.target
                        .value
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
                    e
                  ) =>
                    set(
                      'kota',
                      e.target
                        .value
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
                    e
                  ) =>
                    set(
                      'provinsi',
                      e.target
                        .value
                    )
                  }
                />
              </FormField>
            </div>
          </FormSection>

          {/* INFO */}
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

      {/* BUTTON */}
      <div className="flex justify-end">
        <Button
          onClick={
            handleSubmit
          }
          disabled={loading}
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