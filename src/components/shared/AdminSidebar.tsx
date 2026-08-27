import {
  BarChart3,
  ChevronRight,
  ClipboardCheck,
  FileBarChart,
  FileText,
  Home,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react'
import {
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  useEffect,
  useState,
} from 'react'

interface MenuItem {
  label: string
  path: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: <Home size={20} />,
  },
  {
    label: 'Data Mustahik',
    path: '/admin/mustahik',
    icon: <Users size={20} />,
  },
  {
    label: 'Verifikasi',
    path: '/admin/verifikasi',
    icon: <ClipboardCheck size={20} />,
  },
  {
    label: 'Kriteria',
    path: '/admin/kriteria',
    icon: <SlidersHorizontal size={20} />,
  },
  {
    label: 'Subkriteria',
    path: '/admin/subkriteria',
    icon: <ListChecks size={20} />,
  },
  {
    label: 'Proses TOPSIS',
    path: '/admin/topsis',
    icon: <BarChart3 size={20} />,
  },
  {
    label: 'Hasil Ranking',
    path: '/admin/ranking',
    icon: <FileText size={20} />,
  },
  {
    label: 'Laporan',
    path: '/admin/laporan',
    icon: <FileBarChart size={20} />,
  },
  {
    label: 'Pengaturan',
    path: '/admin/pengaturan',
    icon: <Settings size={20} />,
  },
]

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] =
    useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('auth')

    sessionStorage.clear()

    navigate('/login', {
      replace: true,
    })
  }

  const sidebarContent = (
    <>
      {/* LOGO */}

      <div className="flex h-20 items-center border-b border-slate-200 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-600 text-sm font-bold text-white shadow-sm">
            SPK
          </div>

          <div className="min-w-0 overflow-hidden whitespace-nowrap">
            <p className="truncate text-sm font-bold text-slate-900">
              SPK Mustahik
            </p>

            <p className="truncate text-xs text-slate-500">
              Panel Admin
            </p>
          </div>
        </div>
      </div>

      {/* MENU */}

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu Admin
        </p>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  'group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-green-50 hover:text-green-700',
                ].join(' ')
              }
            >
              <span className="shrink-0">
                {item.icon}
              </span>

              <span className="min-w-0 flex-1 truncate whitespace-nowrap">
                {item.label}
              </span>

              <ChevronRight
                size={16}
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ADMIN INFO + LOGOUT */}

      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
            A
          </div>

          <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
            <p className="truncate text-sm font-semibold text-slate-800">
              Administrator
            </p>

            <p className="truncate text-xs text-slate-500">
              Admin SPK Mustahik
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut
            size={20}
            className="shrink-0"
          />

          <span className="whitespace-nowrap">
            Logout
          </span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* MOBILE HEADER */}

      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-sm font-bold text-white">
            SPK
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">
              SPK Mustahik
            </p>

            <p className="text-xs text-slate-500">
              Panel Admin
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* DESKTOP SIDEBAR */}

      <aside className="group/admin-sidebar fixed inset-y-0 left-0 z-50 hidden w-20 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-sm transition-all duration-300 hover:w-64 lg:flex">
        {sidebarContent}
      </aside>

      {/* MOBILE SIDEBAR */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        >
          <aside
            className="flex h-full w-72 flex-col bg-white shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex justify-end p-3">
              <button
                type="button"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="-mt-3 flex min-h-0 flex-1 flex-col">
              {sidebarContent}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}