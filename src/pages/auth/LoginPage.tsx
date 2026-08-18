import { useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

interface LoginLocationState {
  registered?: boolean
  email?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    loginSession,
  } = useAuth()

  const [showPassword, setShowPassword] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [errorMsg, setErrorMsg] =
    useState('')

  const [successMsg, setSuccessMsg] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  // ==================================================
  // CEK HASIL REGISTER
  // ==================================================

  useEffect(() => {
    const state =
      location.state as
        | LoginLocationState
        | null

    if (!state?.registered) {
      return
    }

    setSuccessMsg(
      'Registrasi berhasil. Silakan login menggunakan akun yang baru dibuat.'
    )

    if (state.email) {
      setEmail(state.email)
    }

    // Bersihkan state agar pesan
    // tidak muncul lagi saat refresh.
    navigate(location.pathname, {
      replace: true,
      state: null,
    })
  }, [
    location,
    navigate,
  ])

  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = async () => {
    const cleanEmail =
      email.trim().toLowerCase()

    // ============================
    // VALIDASI
    // ============================

    if (!cleanEmail) {
      setErrorMsg(
        'Email wajib diisi.'
      )
      return
    }

    if (!password) {
      setErrorMsg(
        'Password wajib diisi.'
      )
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // ============================
      // REQUEST LOGIN
      // ============================

      const response =
        await api.post(
          '/auth/login',
          {
            email: cleanEmail,
            password,
          }
        )

      console.log(
        'LOGIN RESPONSE:',
        response.data
      )

      // ============================
      // CEK RESPONSE
      // ============================

      if (
        !response.data ||
        !response.data.success
      ) {
        setErrorMsg(
          response.data?.message ||
            'Login gagal.'
        )
        return
      }

      const token =
        response.data?.data?.token

      const user =
        response.data?.data?.user

      // ============================
      // PASTIKAN DATA LENGKAP
      // ============================

      if (!token) {
        setErrorMsg(
          'Token login tidak ditemukan dari server.'
        )
        return
      }

      if (!user) {
        setErrorMsg(
          'Data user tidak ditemukan dari server.'
        )
        return
      }

      console.log(
        'LOGIN USER:',
        user
      )

      // ============================
      // SIMPAN SESSION
      // ============================

      loginSession(
        token,
        user
      )

      // ============================
      // REDIRECT
      // ============================

      const role =
        String(
          user.role
        ).toUpperCase()

      console.log(
        'LOGIN ROLE:',
        role
      )

      if (role === 'ADMIN') {
        navigate(
          '/admin/dashboard',
          {
            replace: true,
          }
        )

        return
      }

      navigate(
        '/dashboard',
        {
          replace: true,
        }
      )
    } catch (error: any) {
      console.error(
        'LOGIN ERROR:',
        error
      )

      // ============================
      // ERROR BACKEND
      // ============================

      if (error.response) {
        setErrorMsg(
          error.response.data?.message ||
            'Email atau password salah.'
        )

        return
      }

      // ============================
      // BACKEND MATI
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
        'Terjadi kesalahan saat login.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==================================================
  // SUBMIT FORM
  // ==================================================

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    handleLogin()
  }

  // ==================================================
  // LOGIN CEPAT
  // ==================================================

  const fillQuickLogin = (
    role: 'user' | 'admin'
  ) => {
    if (role === 'user') {
      const demoEmail =
        'user@example.com'

      const demoPassword =
        'userpassword'

      setEmail(demoEmail)
      setPassword(demoPassword)

      handleLoginWithCredentials(
        demoEmail,
        demoPassword
      )

      return
    }

    const demoEmail =
      'admin@spkmustahik.id'

    const demoPassword =
      'adminpassword'

    setEmail(demoEmail)
    setPassword(demoPassword)

    handleLoginWithCredentials(
      demoEmail,
      demoPassword
    )
  }

  // ==================================================
  // LOGIN DENGAN DATA TERTENTU
  // ==================================================

  const handleLoginWithCredentials =
    async (
      emailValue: string,
      passwordValue: string
    ) => {
      const cleanEmail =
        emailValue
          .trim()
          .toLowerCase()

      setLoading(true)
      setErrorMsg('')
      setSuccessMsg('')

      try {
        const response =
          await api.post(
            '/auth/login',
            {
              email: cleanEmail,
              password:
                passwordValue,
            }
          )

        console.log(
          'QUICK LOGIN RESPONSE:',
          response.data
        )

        if (
          !response.data?.success
        ) {
          setErrorMsg(
            response.data?.message ||
              'Login gagal.'
          )
          return
        }

        const token =
          response.data?.data?.token

        const user =
          response.data?.data?.user

        if (!token || !user) {
          setErrorMsg(
            'Data login dari server tidak lengkap.'
          )
          return
        }

        loginSession(
          token,
          user
        )

        const role =
          String(
            user.role
          ).toUpperCase()

        if (role === 'ADMIN') {
          navigate(
            '/admin/dashboard',
            {
              replace: true,
            }
          )
        } else {
          navigate(
            '/dashboard',
            {
              replace: true,
            }
          )
        }
      } catch (error: any) {
        console.error(
          'QUICK LOGIN ERROR:',
          error
        )

        if (error.response) {
          setErrorMsg(
            error.response.data?.message ||
              'Email atau password salah.'
          )
        } else if (
          error.request
        ) {
          setErrorMsg(
            'Backend tidak dapat dihubungi.'
          )
        } else {
          setErrorMsg(
            'Terjadi kesalahan saat login.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Masuk ke Akun
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Ketik email dan password Anda
          untuk masuk
        </p>

        {/* SUCCESS */}
        {successMsg && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg font-medium">
            {successMsg}
          </div>
        )}

        {/* ERROR */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {errorMsg}
          </div>
        )}
      </div>

      {/* LOGIN FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* EMAIL */}
        <FormField
          label="Email"
          htmlFor="login-email"
          required
        >
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="nama@example.com"
              className="pl-9"
              value={email}
              onChange={(e) =>
                setEmail(
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
          htmlFor="login-password"
          required
        >
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <Input
              id="login-password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="current-password"
              placeholder="Ketik password"
              className="pl-9 pr-10"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
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

        {/* OPTIONS */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded border-slate-300 text-green-600 accent-green-600"
            />

            <span className="text-sm text-slate-600">
              Ingat saya
            </span>
          </label>

          <button
            type="button"
            className="text-sm text-green-600 hover:underline font-medium"
          >
            Lupa password?
          </button>
        </div>

        {/* SUBMIT */}
        <Button
          type="submit"
          className="w-full mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </Button>
      </form>

      {/* REGISTER */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="text-green-600 font-semibold hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>

      {/* LOGIN CEPAT */}
      <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500 font-semibold mb-2">
          Login Cepat
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              fillQuickLogin('user')
            }
            disabled={loading}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 hover:text-green-700 transition-colors shadow-sm flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-bold text-slate-900">
              Login User
            </span>

            <span className="text-[10px] text-slate-400">
              user@example.com
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              fillQuickLogin('admin')
            }
            disabled={loading}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 hover:text-green-700 transition-colors shadow-sm flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-bold text-slate-900">
              Login Admin
            </span>

            <span className="text-[10px] text-slate-400">
              admin@spkmustahik.id
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}