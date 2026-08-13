import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { useState } from 'react'

export function RegisterPage() {
  const navigate = useNavigate()
  const { loginSession } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    if (form.password !== form.confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password
      })

      if (response.data?.success) {
        // Setelah sukses register, langsung login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
          email: form.email,
          password: form.password
        })

        if (loginResponse.data?.success) {
          const { token, user } = loginResponse.data.data
          loginSession(token, user)
          navigate('/dashboard')
        } else {
          navigate('/login')
        }
      } else {
        setErrorMsg(response.data?.message || 'Registrasi gagal')
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat registrasi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Buat Akun Baru</h2>
        <p className="text-sm text-slate-500 mt-1">
          Daftar untuk mengajukan permohonan sebagai mustahik
        </p>
        {errorMsg && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {errorMsg}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nama Lengkap" htmlFor="name" required>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="name"
              type="text"
              placeholder="Nama lengkap Anda"
              className="pl-9"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
        </FormField>

        <FormField label="Alamat Email" htmlFor="reg-email" required>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="reg-email"
              type="email"
              placeholder="nama@example.com"
              className="pl-9"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </FormField>

        <FormField label="Nomor HP" htmlFor="phone" required hint="Format: 08xxxxxxxxxx">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              className="pl-9"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
        </FormField>

        <FormField label="Password" htmlFor="reg-password" required hint="Minimal 8 karakter">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Buat password"
              className="pl-9 pr-10"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FormField>

        <FormField label="Konfirmasi Password" htmlFor="confirm-password" required>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="confirm-password"
              type="password"
              placeholder="Ulangi password"
              className="pl-9"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>
        </FormField>

        <div className="flex items-start gap-2 mt-2">
          <input
            type="checkbox"
            id="terms"
            className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 accent-green-600"
            required
          />
          <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
            Saya menyetujui{' '}
            <span className="text-green-600 font-medium hover:underline cursor-pointer">
              Syarat & Ketentuan
            </span>{' '}
            yang berlaku
          </label>
        </div>

        <Button type="submit" className="w-full mt-2" disabled={loading}>
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

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
