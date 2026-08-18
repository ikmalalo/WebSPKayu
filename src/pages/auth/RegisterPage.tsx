import { useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import api from '@/lib/api'

export function RegisterPage() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [errorMsg, setErrorMsg] =
    useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setErrorMsg('')

    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    const phone = form.phone.trim()
    const password = form.password
    const confirmPassword = form.confirmPassword

    // ============================
    // VALIDASI FRONTEND
    // ============================

    if (!name) {
      setErrorMsg(
        'Nama lengkap wajib diisi.'
      )
      return
    }

    if (name.length < 3) {
      setErrorMsg(
        'Nama minimal 3 karakter.'
      )
      return
    }

    if (!email) {
      setErrorMsg(
        'Email wajib diisi.'
      )
      return
    }

    if (!phone) {
      setErrorMsg(
        'Nomor HP wajib diisi.'
      )
      return
    }

    if (!password) {
      setErrorMsg(
        'Password wajib diisi.'
      )
      return
    }

    if (password.length < 8) {
      setErrorMsg(
        'Password minimal 8 karakter.'
      )
      return
    }

    if (
      password !==
      confirmPassword
    ) {
      setErrorMsg(
        'Konfirmasi password tidak cocok.'
      )
      return
    }

    setLoading(true)

    try {
      // ============================
      // REGISTER
      // ============================

      const response =
        await api.post(
          '/auth/register',
          {
            name,
            email,
            phone,
            password,
          }
        )

      console.log(
        'REGISTER RESPONSE:',
        response.data
      )

      // ============================
      // CEK RESPONSE BACKEND
      // ============================

      if (
        !response.data ||
        !response.data.success
      ) {
        setErrorMsg(
          response.data?.message ||
            'Registrasi gagal.'
        )
        return
      }

      // ============================
      // REGISTER BERHASIL
      //
      // Tidak langsung login.
      // Arahkan ke halaman login.
      // ============================

      navigate('/login', {
        replace: true,
        state: {
          registered: true,
          email,
        },
      })
    } catch (error: any) {
      console.error(
        'REGISTER ERROR:',
        error
      )

      // ============================
      // ERROR DARI BACKEND
      // ============================

      if (error.response) {
        setErrorMsg(
          error.response.data?.message ||
            'Registrasi gagal.'
        )

        return
      }

      // ============================
      // BACKEND TIDAK TERHUBUNG
      // ============================

      if (error.request) {
        setErrorMsg(
          'Server backend tidak dapat dihubungi. Pastikan backend berjalan di http://localhost:5000.'
        )

        return
      }

      // ============================
      // ERROR LAIN
      // ============================

      setErrorMsg(
        'Terjadi kesalahan saat melakukan registrasi.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Buat Akun Baru
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Daftar untuk mengajukan permohonan
          sebagai mustahik
        </p>

        {/* ERROR */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {errorMsg}
          </div>
        )}
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* NAMA */}
        <FormField
          label="Nama Lengkap"
          htmlFor="name"
          required
        >
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Nama lengkap Anda"
              className="pl-9"
              value={form.name}
              onChange={(e) =>
                handleChange(
                  'name',
                  e.target.value
                )
              }
              required
            />
          </div>
        </FormField>

        {/* EMAIL */}
        <FormField
          label="Alamat Email"
          htmlFor="reg-email"
          required
        >
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="nama@example.com"
              className="pl-9"
              value={form.email}
              onChange={(e) =>
                handleChange(
                  'email',
                  e.target.value
                )
              }
              required
            />
          </div>
        </FormField>

        {/* NOMOR HP */}
        <FormField
          label="Nomor HP"
          htmlFor="phone"
          required
          hint="Format: 08xxxxxxxxxx"
        >
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="08xxxxxxxxxx"
              className="pl-9"
              value={form.phone}
              onChange={(e) =>
                handleChange(
                  'phone',
                  e.target.value
                )
              }
              required
            />
          </div>
        </FormField>

        {/* PASSWORD */}
        <FormField
          label="Password"
          htmlFor="reg-password"
          required
          hint="Minimal 8 karakter"
        >
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <Input
              id="reg-password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="new-password"
              placeholder="Buat password"
              className="pl-9 pr-10"
              value={form.password}
              onChange={(e) =>
                handleChange(
                  'password',
                  e.target.value
                )
              }
              required
              minLength={8}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (prev) => !prev
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </FormField>

        {/* KONFIRMASI PASSWORD */}
        <FormField
          label="Konfirmasi Password"
          htmlFor="confirm-password"
          required
        >
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Ulangi password"
              className="pl-9"
              value={
                form.confirmPassword
              }
              onChange={(e) =>
                handleChange(
                  'confirmPassword',
                  e.target.value
                )
              }
              required
            />
          </div>
        </FormField>

        {/* TERMS */}
        <div className="flex items-start gap-2 mt-2">
          <input
            type="checkbox"
            id="terms"
            className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 accent-green-600"
            required
          />

          <label
            htmlFor="terms"
            className="text-sm text-slate-600 cursor-pointer"
          >
            Saya menyetujui{' '}
            <span className="text-green-600 font-medium">
              Syarat & Ketentuan
            </span>{' '}
            yang berlaku
          </label>
        </div>

        {/* BUTTON */}
        <Button
          type="submit"
          className="w-full mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mendaftar...
            </>
          ) : (
            'Daftar Sekarang'
          )}
        </Button>
      </form>

      {/* LOGIN LINK */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="text-green-600 font-semibold hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}