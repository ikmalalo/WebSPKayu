import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { PelaksanaSidebar } from '@/components/shared/PelaksanaSidebar'
import { Topbar } from '@/components/shared/Topbar'
import { useAuth } from '@/context/AuthContext'

export function PelaksanaLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentUser, isAuthenticated } = useAuth()

  // Guard role: Wajib terotentikasi dan memiliki role PELAKSANA
  if (!isAuthenticated || currentUser?.role !== 'PELAKSANA') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar */}
      <PelaksanaSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300 ease-in-out">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

