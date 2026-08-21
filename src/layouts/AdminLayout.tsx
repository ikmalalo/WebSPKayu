import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  LayoutDashboard,
  Users,
  FileCheck,
  ClipboardList,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import {
  useAuth,
} from '@/contexts/AuthContext'

type AdminLayoutProps = {
  children?: ReactNode
}

type MenuItem = {
  label: string
  path: string
  icon: ReactNode
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: 'Data Mustahik',
    path: '/admin/mustahik',
    icon: <Users size={20} />,
  },
  {
    label: 'Verifikasi',
    path: '/admin/verifikasi',
    icon: <FileCheck size={20} />,
  },
  {
    label: 'Pengajuan',
    path: '/admin/pengajuan',
    icon: <ClipboardList size={20} />,
  },
  {
    label: 'Proses TOPSIS',
    path: '/admin/topsis',
    icon: <BarChart3 size={20} />,
  },
  {
    label: 'Hasil Ranking',
    path: '/admin/hasil-ranking',
    icon: <ClipboardList size={20} />,
  },
  {
    label: 'Laporan',
    path: '/admin/laporan',
    icon: <FileText size={20} />,
  },
]

export function AdminLayout({
  children,
}: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const {
    user,
    logout,
  } = useAuth()

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false)

  const [
    collapsed,
    setCollapsed,
  ] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()

    navigate('/login')
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (user.role !== 'ADMIN') {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  const renderContent = () => {
    if (children) {
      return children
    }

    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          border-r
          bg-white
          transition-all
          duration-300
          ${
            collapsed
              ? 'w-20'
              : 'w-72'
          }
          ${
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
          lg:translate-x-0
        `}
      >
        {/* LOGO */}

        <div className="flex h-20 items-center justify-between border-b px-4">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 font-bold text-white">
                SPK
              </div>

              <div>
                <h1 className="text-sm font-bold text-slate-800">
                  SPK Kayu
                </h1>

                <p className="text-xs text-slate-500">
                  Panel Admin
                </p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 font-bold text-white">
              SPK
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {menuItems.map(
            (item) => {
              const isActive =
                location.pathname ===
                item.path

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() =>
                    navigate(item.path)
                  }
                  title={
                    collapsed
                      ? item.label
                      : undefined
                  }
                  className={`
                    flex w-full items-center gap-3
                    rounded-xl px-3 py-3
                    text-sm font-medium
                    transition-colors
                    ${
                      isActive
                        ? 'bg-green-600 text-white'
                        : 'text-slate-600 hover:bg-green-50 hover:text-green-700'
                    }
                    ${
                      collapsed
                        ? 'justify-center'
                        : ''
                    }
                  `}
                >
                  {item.icon}

                  {!collapsed && (
                    <span>
                      {item.label}
                    </span>
                  )}
                </button>
              )
            }
          )}
        </nav>

        {/* USER */}

        <div className="border-t p-3">
          {!collapsed && (
            <div className="mb-3 rounded-xl bg-slate-50 p-3">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user.name}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user.email}
              </p>

              <p className="mt-1 text-xs font-medium text-green-600">
                Administrator
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title={
              collapsed
                ? 'Keluar'
                : undefined
            }
            className={`
              flex w-full items-center gap-3
              rounded-xl px-3 py-3
              text-sm font-medium
              text-red-600
              transition-colors
              hover:bg-red-50
              ${
                collapsed
                  ? 'justify-center'
                  : ''
              }
            `}
          >
            <LogOut size={20} />

            {!collapsed && (
              <span>
                Keluar
              </span>
            )}
          </button>
        </div>

        {/* COLLAPSE DESKTOP */}

        <button
          type="button"
          onClick={() =>
            setCollapsed(
              (previous) =>
                !previous
            )
          }
          className="absolute -right-4 top-24 hidden h-8 w-8 items-center justify-center rounded-full border bg-white shadow-sm hover:bg-slate-50 lg:flex"
        >
          {collapsed ? (
            <ChevronRight
              size={16}
            />
          ) : (
            <ChevronLeft
              size={16}
            />
          )}
        </button>
      </aside>

      {/* MAIN AREA */}

      <div
        className={`
          min-h-screen
          transition-all
          duration-300
          ${
            collapsed
              ? 'lg:pl-20'
              : 'lg:pl-72'
          }
        `}
      >
        {/* TOPBAR */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="font-semibold text-slate-800">
                Panel Administrator
              </h2>

              <p className="text-xs text-slate-500">
                Sistem Pendukung Keputusan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">
                {user.name}
              </p>

              <p className="text-xs text-slate-500">
                ADMIN
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
              {user.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : 'A'}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <main className="p-4 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}