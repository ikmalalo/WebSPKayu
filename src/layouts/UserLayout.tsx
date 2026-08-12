import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { UserSidebar } from '@/components/shared/UserSidebar'
import { Topbar } from '@/components/shared/Topbar'

export function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar */}
      <UserSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-3 peer-hover:lg:pl-64 transition-all duration-300 ease-in-out">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
