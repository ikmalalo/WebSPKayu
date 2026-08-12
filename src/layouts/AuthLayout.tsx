import { Outlet } from 'react-router-dom'
import { Leaf } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600 rounded-2xl mb-4 shadow-sm">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SPK Mustahik</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistem Pendukung Keputusan Kelayakan Mustahik
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2024 SPK Mustahik. Sistem Pengelolaan Zakat.
        </p>
      </div>
    </div>
  )
}
