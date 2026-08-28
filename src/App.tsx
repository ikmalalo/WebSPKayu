import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { AuthLayout } from '@/layouts/AuthLayout'
import { UserLayout } from '@/layouts/UserLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

import { UserDashboardPage } from '@/pages/user/DashboardPage'
import { PengajuanPage } from '@/pages/user/PengajuanPage'
import { FormDataMustahikPage } from '@/pages/user/FormDataMustahikPage'
import { KuesionerPage } from '@/pages/user/KuesionerPage'
import { PantauHasilPage } from '@/pages/user/PantauHasilPage'
import { DetailHasilPage } from '@/pages/user/DetailHasilPage'
import { ProfilPage } from '@/pages/user/ProfilPage'

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import DataMustahikPage from '@/pages/admin/DataMustahikPage'
import { DetailMustahikPage } from '@/pages/admin/DetailMustahikPage'
import { VerifikasiPage } from '@/pages/admin/VerifikasiPage'
import DetailVerifikasiPage from '@/pages/admin/DetailVerifikasiPage'
import { KriteriaPage } from '@/pages/admin/KriteriaPage'
import { SubkriteriaPage } from '@/pages/admin/SubkriteriaPage'
import { KonfigurasiTopsisPage } from '@/pages/admin/KonfigurasiTopsisPage'
import { ProcessTopsisPage } from '@/pages/admin/ProcessTopsisPage'
import { HasilRankingPage } from '@/pages/admin/HasilRankingPage'
import { LaporanPage } from '@/pages/admin/LaporanPage'
import { PengaturanPage } from '@/pages/admin/PengaturanPage'

import { PengajuanProvider } from '@/context/PengajuanContext'
import { AuthProvider } from '@/context/AuthContext'

import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export default function App() {
  return (
    <AuthProvider>
      <PengajuanProvider>
        <BrowserRouter
          basename={import.meta.env.BASE_URL}
        >
          <ErrorBoundary>
            <Routes>

              {/* ==================== AUTH ==================== */}

              <Route element={<AuthLayout />}>
                <Route
                  path="/login"
                  element={<LoginPage />}
                />

                <Route
                  path="/register"
                  element={<RegisterPage />}
                />

                <Route
                  path="/admin/login"
                  element={<LoginPage />}
                />
              </Route>

              {/* ==================== USER ==================== */}

              <Route element={<UserLayout />}>
                <Route
                  path="/dashboard"
                  element={
                    <UserDashboardPage />
                  }
                />

                <Route
                  path="/pengajuan"
                  element={
                    <PengajuanPage />
                  }
                />

                <Route
                  path="/pengajuan/form"
                  element={
                    <FormDataMustahikPage />
                  }
                />

                <Route
                  path="/kuesioner"
                  element={
                    <KuesionerPage />
                  }
                />

                <Route
                  path="/pantau-hasil"
                  element={
                    <PantauHasilPage />
                  }
                />

                <Route
                  path="/pantau-hasil/detail"
                  element={
                    <DetailHasilPage />
                  }
                />

                <Route
                  path="/profil"
                  element={
                    <ProfilPage />
                  }
                />
              </Route>

              {/* ==================== ADMIN ==================== */}

              <Route element={<AdminLayout />}>
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminDashboardPage />
                  }
                />

                <Route
                  path="/admin/mustahik"
                  element={
                    <DataMustahikPage />
                  }
                />

                <Route
                  path="/admin/mustahik/:id"
                  element={
                    <DetailMustahikPage />
                  }
                />

                <Route
                  path="/admin/verifikasi"
                  element={
                    <VerifikasiPage />
                  }
                />

                <Route
                  path="/admin/verifikasi/:id"
                  element={
                    <DetailVerifikasiPage />
                  }
                />

                <Route
                  path="/admin/kriteria"
                  element={
                    <KriteriaPage />
                  }
                />

                <Route
                  path="/admin/subkriteria"
                  element={
                    <SubkriteriaPage />
                  }
                />

                <Route
                  path="/admin/konfigurasi-topsis"
                  element={
                    <KonfigurasiTopsisPage />
                  }
                />

                <Route
                  path="/admin/topsis"
                  element={
                    <ProcessTopsisPage />
                  }
                />

                <Route
                  path="/admin/ranking"
                  element={
                    <HasilRankingPage />
                  }
                />

                <Route
                  path="/admin/laporan"
                  element={
                    <LaporanPage />
                  }
                />

                <Route
                  path="/admin/pengaturan"
                  element={
                    <PengaturanPage />
                  }
                />
              </Route>

              {/* ==================== DEFAULT ==================== */}

              <Route
                path="/"
                element={
                  <Navigate
                    to="/login"
                    replace
                  />
                }
              />

              <Route
                path="*"
                element={
                  <Navigate
                    to="/login"
                    replace
                  />
                }
              />

            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </PengajuanProvider>
    </AuthProvider>
  )
}