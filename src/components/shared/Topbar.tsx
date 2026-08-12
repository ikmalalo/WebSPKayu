import { Bell, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

interface TopbarProps {
  onMenuClick: () => void
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pengajuan': 'Pengajuan',
  '/pengajuan/form': 'Form Pengajuan',
  '/kuesioner': 'Kuesioner',
  '/pantau-hasil': 'Pantau Hasil',
  '/profil': 'Profil',
  '/admin/dashboard': 'Dashboard',
  '/admin/mustahik': 'Data Mustahik',
  '/admin/verifikasi': 'Verifikasi',
  '/admin/kriteria': 'Kriteria TOPSIS',
  '/admin/subkriteria': 'Subkriteria',
  '/admin/topsis': 'Proses TOPSIS',
  '/admin/ranking': 'Hasil Ranking',
  '/admin/laporan': 'Laporan',
  '/admin/pengaturan': 'Pengaturan',
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation()
  const currentPath = location.pathname
  const pageTitle = routeLabels[currentPath] || 'SPK Mustahik'

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-semibold text-slate-700">{pageTitle}</h2>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  )
}
