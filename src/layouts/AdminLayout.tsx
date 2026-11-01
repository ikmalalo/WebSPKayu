import { useState, type ReactNode } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { AdminSidebar } from '../components/shared/AdminSidebar'
import { Topbar } from '../components/shared/Topbar'
import { useAuth } from '@/context/AuthContext'

interface AdminLayoutProps {
  children?: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentUser, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Memeriksa autentikasi...</div>
      </div>
    )
  }

  if (!isAuthenticated || currentUser?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-3 peer-hover:lg:pl-64 transition-all duration-300 ease-in-out">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout