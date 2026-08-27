import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/shared/AdminSidebar'

interface AdminLayoutProps {
  children?: ReactNode
}

export function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="min-h-screen lg:ml-20">
        <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout