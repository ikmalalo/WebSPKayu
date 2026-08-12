import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ListChecks,
  GitBranch,
  Calculator,
  Trophy,
  FileBarChart2,
  Settings,
  LogOut,
  Leaf,
  X,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { currentAdmin } from '@/data/mockData'

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/mustahik', icon: Users, label: 'Data Mustahik' },
  { to: '/admin/verifikasi', icon: ShieldCheck, label: 'Verifikasi' },
  { to: '/admin/kriteria', icon: ListChecks, label: 'Kriteria' },
  { to: '/admin/subkriteria', icon: GitBranch, label: 'Subkriteria' },
  { to: '/admin/topsis', icon: Calculator, label: 'Proses TOPSIS' },
  { to: '/admin/ranking', icon: Trophy, label: 'Hasil Ranking' },
  { to: '/admin/laporan', icon: FileBarChart2, label: 'Laporan' },
  { to: '/admin/pengaturan', icon: Settings, label: 'Pengaturan' },
]

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/admin/login')
  }

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'group peer fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 transition-all duration-300 ease-in-out shadow-lg',
          // Hover-expand behavior on desktop
          'lg:translate-x-0 lg:-translate-x-[calc(100%-12px)] lg:hover:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">SPK Mustahik</span>
              <p className="text-xs text-slate-400 leading-none">Panel Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin info */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold">
              {currentAdmin.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{currentAdmin.name}</p>
              <p className="text-xs text-green-600 font-medium">Administrator</p>
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
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="sidebar-link sidebar-link-inactive w-full text-red-500 hover:bg-red-50 hover:text-red-600"
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
