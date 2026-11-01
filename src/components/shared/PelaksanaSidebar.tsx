import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardCheck,
  LogOut,
  X,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import logoImg from '@/assets/logo.png'
import { cn } from '@/lib/utils'

interface PelaksanaSidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { to: '/pelaksana/dashboard', icon: LayoutDashboard, label: 'Dashboard Tugas' },
  { to: '/pelaksana/tugas', icon: ClipboardCheck, label: 'Daftar Tugas Survei' },
]

export function PelaksanaSidebar({ open, onClose }: PelaksanaSidebarProps) {
  const navigate = useNavigate()
  const { currentUser, logoutSession } = useAuth()

  const handleLogout = () => {
    logoutSession()
    navigate('/login')
  }

  const displayName = currentUser?.name || 'Pelaksana Lapangan'
  const displayEmail = currentUser?.email || 'pelaksana@spkayu.com'

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo SPK" className="h-9 w-9 object-contain" />
            <div>
              <span className="font-bold text-base tracking-tight text-slate-800 dark:text-white">
                WebSPKayu
              </span>
              <span className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                PORTAL PELAKSANA
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 border border-emerald-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {displayEmail}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Petugas Survei
              </span>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>
    </>
  )
}

