import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { OrganizationsPage } from '@/features/organizations/pages/OrganizationsPage'
import { OrganizationDetailPage } from '@/features/organizations/pages/OrganizationDetailPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/organizations"
            element={
              <ProtectedRoute>
                <OrganizationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/organizations/:orgId"
            element={
              <ProtectedRoute>
                <OrganizationDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
