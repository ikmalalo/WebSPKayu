import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  SlidersHorizontal,
  ListChecks,
  Sliders,
  BarChart3,
  FileText,
  FileBarChart,
  Settings,
  LogOut,
  X,
  Menu,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import logoImg from '@/assets/logo.png'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/mustahik', icon: Users, label: 'Data Mustahik' },
  { to: '/admin/verifikasi', icon: ClipboardCheck, label: 'Verifikasi' },
  { to: '/admin/kriteria', icon: SlidersHorizontal, label: 'Kriteria TOPSIS' },
  { to: '/admin/subkriteria', icon: ListChecks, label: 'Subkriteria' },
  { to: '/admin/konfigurasi-topsis', icon: Sliders, label: 'Konfigurasi TOPSIS' },
  { to: '/admin/topsis', icon: BarChart3, label: 'Proses TOPSIS' },
  { to: '/admin/ranking', icon: FileText, label: 'Hasil Ranking' },
  { to: '/admin/laporan', icon: FileBarChart, label: 'Laporan' },
  { to: '/admin/pengaturan', icon: Settings, label: 'Pengaturan' },
]

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const navigate = useNavigate()
  const { currentUser, logoutSession } = useAuth()

  const handleLogout = () => {
    logoutSession()
    navigate('/login', { replace: true })
  }

  const displayName = currentUser?.name || 'Administrator'
  const displayEmail = currentUser?.email || 'admin@maqzis.id'

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'group peer fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 transition-all duration-300 ease-in-out shadow-lg',
          // Hover-expand behavior on desktop
          'lg:translate-x-0 lg:-translate-x-[calc(100%-12px)] lg:hover:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="Logo MAQZIS" className="w-8 h-8 object-contain rounded-lg" />
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">MAQZIS</span>
              <p className="text-xs text-slate-400 leading-none">Panel Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin info */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-950/80 flex items-center justify-center text-green-700 dark:text-green-300 text-sm font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn('sidebar-link', isActive ? 'sidebar-link-active' : 'sidebar-link-inactive')
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="sidebar-link sidebar-link-inactive w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>

        {/* Floating Hint Handle for Desktop */}
        <div className="hidden lg:flex absolute top-1/2 -right-6 -translate-y-1/2 w-6 h-14 bg-green-600 text-white rounded-r-xl shadow-md items-center justify-center cursor-pointer group-hover:opacity-0 transition-opacity">
          <ChevronRight className="w-4 h-4 animate-pulse" />
        </div>
      </aside>
    </>
  )
}

// Mobile toggle button
interface MobileMenuButtonProps {
  onClick: () => void
}

export function AdminMobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
    >
      <Menu className="w-5 h-5" />
    </button>
  )
}

export default AdminSidebar