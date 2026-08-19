import { Outlet } from 'react-router-dom'
import logoImg from '@/assets/logo.png'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-sm">
            <img src={logoImg} alt="Logo MAQZIS" className="w-14 h-14 object-contain rounded-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">MAQZIS</h1>
          <p className="text-sm text-slate-500 mt-1">
            Maqashid-Based Zakat Information System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2024 MAQZIS. Maqashid-Based Zakat Information System.
        </p>
      </div>
    </div>
  )
}
