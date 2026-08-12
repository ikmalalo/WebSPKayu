import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate login
    setTimeout(() => {
      setLoading(false)
      if (form.email.includes('admin')) {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    }, 1000)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Masuk ke Akun</h2>
        <p className="text-sm text-slate-500 mt-1">
          Masukkan email dan password Anda untuk melanjutkan
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Alamat Email" htmlFor="email" required>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="nama@example.com"
              className="pl-9"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              placeholder="Masukkan password"
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

      {/* Demo hint */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500 font-medium mb-1">Demo Login:</p>
        <p className="text-xs text-slate-400">User: <span className="font-mono">user@example.com</span></p>
        <p className="text-xs text-slate-400">Admin: <span className="font-mono">admin@spkmustahik.id</span></p>
        <p className="text-xs text-slate-400">Password: <span className="font-mono">sembarang</span></p>
      </div>
    </div>
  )
}
