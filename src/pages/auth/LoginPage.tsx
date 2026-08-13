import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { useState } from 'react'

export function LoginPage() {
  const navigate = useNavigate()
  const { loginSession } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (emailVal: string, passwordVal: string) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: emailVal,
        password: passwordVal
      })

      if (response.data?.success) {
        const { token, user } = response.data.data
        loginSession(token, user)
        if (user.role === 'ADMIN') {
          navigate('/admin/dashboard')
        } else {
          navigate('/dashboard')
        }
      } else {
        setErrorMsg(response.data?.message || 'Login gagal')
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(username, password)
  }

  const fillQuickLogin = (role: 'user' | 'admin') => {
    if (role === 'user') {
      setUsername('user@example.com')
      setPassword('userpassword')
      handleLogin('user@example.com', 'userpassword')
    } else {
      setUsername('admin@spkmustahik.id')
      setPassword('adminpassword')
      handleLogin('admin@spkmustahik.id', 'adminpassword')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Masuk ke Akun</h2>
        <p className="text-sm text-slate-500 mt-1">
          Ketik email dan password Anda untuk masuk
        </p>
        {errorMsg && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {errorMsg}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email" htmlFor="username" required>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <Input
              id="username"
              type="text"
              placeholder="nama@example.com"
              className="pl-9"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </FormField>

        <FormField label="Password" htmlFor="password" required>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ketik password"
              className="pl-9 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-green-600 accent-green-600" />
            <span className="text-sm text-slate-600">Ingat saya</span>
          </label>
          <button type="button" className="text-sm text-green-600 hover:underline font-medium">
            Lupa password?
          </button>
        </div>

        <Button type="submit" className="w-full mt-2" disabled={loading}>
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

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Belum punya akun?{' '}
          <Link to="/register" className="text-green-600 font-semibold hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>

      {/* Quick Demo Login Buttons */}
      <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500 font-semibold mb-2">Klik tombol untuk Login Cepat (MySQL):</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillQuickLogin('user')}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 hover:text-green-700 transition-colors shadow-sm flex flex-col items-center justify-center"
          >
            <span className="font-bold text-slate-900">Login User</span>
            <span className="text-[10px] text-slate-400">user@example.com / userpassword</span>
          </button>
          <button
            type="button"
            onClick={() => fillQuickLogin('admin')}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 hover:text-green-700 transition-colors shadow-sm flex flex-col items-center justify-center"
          >
            <span className="font-bold text-slate-900">Login Admin</span>
            <span className="text-[10px] text-slate-400">admin@spkmustahik.id / adminpassword</span>
          </button>
        </div>
      </div>
    </div>
  )
}
